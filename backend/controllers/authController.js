const jwt = require('jsonwebtoken');
const db = require('../config/db');

const normalizeRequiredDash = (value) => {
    const trimmed = String(value || '').trim();
    return trimmed || '-';
};

const isDash = (value) => String(value || '').trim() === '-';

const register = async (req, res) => {
    try {
        const {
            name,
            phone,
            citizen_id,
            email,
            password,
            birth_date,
            gender,
            blood_type,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone
        } = req.body;

        const requiredFields = {
            name,
            phone,
            citizen_id,
            email,
            password,
            birth_date,
            blood_type,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone,
        };

        const missingField = Object.entries(requiredFields).find(([, value]) => !String(value || '').trim());
        if (missingField) {
            return res.status(400).json({
                error: 'Please complete all required fields. If no medical information is available, enter "-".'
            });
        }

        if (!/^0[0-9]{9}$/.test(String(phone).trim())) {
            return res.status(400).json({ error: 'Phone number must start with 0 and contain exactly 10 digits.' });
        }

        if (!/^[0-9]{13}$/.test(String(citizen_id).trim())) {
            return res.status(400).json({ error: 'Citizen ID must contain exactly 13 digits.' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        if (String(password).length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        const birthDate = new Date(birth_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
            return res.status(400).json({ error: 'Date of birth cannot be in the future.' });
        }

        const [existingEmail] = await db.execute('SELECT patient_id FROM Patients WHERE email = ?', [String(email).trim()]);
        if (existingEmail.length > 0) {
            return res.status(409).json({ error: 'This email is already registered.' });
        }

        const [existingCitizenId] = await db.execute('SELECT patient_id FROM Patients WHERE citizen_id = ?', [String(citizen_id).trim()]);
        if (existingCitizenId.length > 0) {
            return res.status(409).json({ error: 'This citizen ID is already registered.' });
        }

        if (!isDash(emergency_contact_phone) && !/^0[0-9]{9}$/.test(String(emergency_contact_phone).trim())) {
            return res.status(400).json({
                error: 'Emergency contact phone must start with 0 and contain exactly 10 digits, or enter "-" if not available.'
            });
        }

        const patient_id = 'P' + Date.now();
        const sql = `INSERT INTO Patients (
                        patient_id, name, phone, citizen_id, email, password, birth_date,
                        gender, blood_type, allergies, chronic_diseases,
                        current_medications, emergency_contact_name, emergency_contact_phone
                     )
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        await db.execute(sql, [
            patient_id,
            String(name).trim(),
            String(phone).trim(),
            String(citizen_id).trim(),
            String(email).trim(),
            password,
            birth_date,
            normalizeRequiredDash(gender),
            normalizeRequiredDash(blood_type),
            normalizeRequiredDash(allergies),
            normalizeRequiredDash(chronic_diseases),
            normalizeRequiredDash(current_medications),
            normalizeRequiredDash(emergency_contact_name),
            normalizeRequiredDash(emergency_contact_phone)
        ]);

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จเรียบร้อย!' });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!String(email || '').trim() || !String(password || '').trim()) {
            return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
        }

        let [users] = await db.execute('SELECT * FROM Patients WHERE email = ?', [String(email).trim()]);
        let role = 'patient';

        if (users.length === 0) {
            [users] = await db.execute('SELECT * FROM Doctors WHERE email = ?', [String(email).trim()]);
            role = 'doctor';
        }

        if (users.length === 0) {
            return res.status(401).json({ error: 'อีเมลไม่ถูกต้อง หรือไม่มีในระบบ' });
        }

        const user = users[0];

        if (user.password !== password) {
            return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
        }

        const token = jwt.sign(
            {
                id: role === 'patient' ? user.patient_id : user.doctor_id,
                role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'เข้าสู่ระบบสำเร็จ!',
            token,
            role,
            user: {
                id: role === 'patient' ? user.patient_id : user.doctor_id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
    }
};


const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'patient') {
            const [rows] = await db.execute(
                `SELECT patient_id AS id, name, phone, citizen_id, email, birth_date,
                        gender, blood_type, allergies, chronic_diseases, current_medications,
                        emergency_contact_name, emergency_contact_phone
                 FROM Patients
                 WHERE patient_id = ?`,
                [req.user.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Patient profile not found.' });
            }

            return res.status(200).json({ role: 'patient', profile: rows[0] });
        }

        if (req.user.role === 'doctor') {
            const [rows] = await db.execute(
                `SELECT doctor_id AS id, name, department, email
                 FROM Doctors
                 WHERE doctor_id = ?`,
                [req.user.id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Doctor profile not found.' });
            }

            return res.status(200).json({ role: 'doctor', profile: rows[0] });
        }

        return res.status(403).json({ error: 'Invalid user role.' });
    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({ error: 'Failed to load profile.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const {
            name,
            phone,
            citizen_id,
            email,
            password,
            birth_date,
            gender,
            blood_type,
            allergies,
            chronic_diseases,
            current_medications,
            emergency_contact_name,
            emergency_contact_phone,
            department,
        } = req.body;

        if (req.user.role === 'patient') {
            const requiredFields = {
                name,
                phone,
                citizen_id,
                email,
                birth_date,
                blood_type,
                allergies,
                chronic_diseases,
                current_medications,
                emergency_contact_name,
                emergency_contact_phone,
            };

            const missingField = Object.entries(requiredFields).find(([, value]) => !String(value || '').trim());
            if (missingField) {
                return res.status(400).json({
                    error: 'Please complete all required fields. If no medical information is available, enter "-".'
                });
            }

            if (!/^0[0-9]{9}$/.test(String(phone).trim())) {
                return res.status(400).json({ error: 'Phone number must start with 0 and contain exactly 10 digits.' });
            }

            if (!/^[0-9]{13}$/.test(String(citizen_id).trim())) {
                return res.status(400).json({ error: 'Citizen ID must contain exactly 13 digits.' });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
                return res.status(400).json({ error: 'Please enter a valid email address.' });
            }

            if (password && String(password).length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters.' });
            }

            const birthDate = new Date(birth_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
                return res.status(400).json({ error: 'Date of birth cannot be in the future.' });
            }

            if (!isDash(emergency_contact_phone) && !/^0[0-9]{9}$/.test(String(emergency_contact_phone).trim())) {
                return res.status(400).json({
                    error: 'Emergency contact phone must start with 0 and contain exactly 10 digits, or enter "-" if not available.'
                });
            }

            const [existingEmail] = await db.execute(
                'SELECT patient_id FROM Patients WHERE email = ? AND patient_id <> ?',
                [String(email).trim(), req.user.id]
            );
            if (existingEmail.length > 0) {
                return res.status(409).json({ error: 'This email is already used by another patient.' });
            }

            const [existingCitizenId] = await db.execute(
                'SELECT patient_id FROM Patients WHERE citizen_id = ? AND patient_id <> ?',
                [String(citizen_id).trim(), req.user.id]
            );
            if (existingCitizenId.length > 0) {
                return res.status(409).json({ error: 'This citizen ID is already used by another patient.' });
            }

            const fields = [
                'name = ?',
                'phone = ?',
                'citizen_id = ?',
                'email = ?',
                'birth_date = ?',
                'gender = ?',
                'blood_type = ?',
                'allergies = ?',
                'chronic_diseases = ?',
                'current_medications = ?',
                'emergency_contact_name = ?',
                'emergency_contact_phone = ?'
            ];

            const values = [
                String(name).trim(),
                String(phone).trim(),
                String(citizen_id).trim(),
                String(email).trim(),
                birth_date,
                normalizeRequiredDash(gender),
                normalizeRequiredDash(blood_type),
                normalizeRequiredDash(allergies),
                normalizeRequiredDash(chronic_diseases),
                normalizeRequiredDash(current_medications),
                normalizeRequiredDash(emergency_contact_name),
                normalizeRequiredDash(emergency_contact_phone),
            ];

            if (password) {
                fields.push('password = ?');
                values.push(password);
            }

            values.push(req.user.id);

            await db.execute(`UPDATE Patients SET ${fields.join(', ')} WHERE patient_id = ?`, values);

            const [updatedRows] = await db.execute(
                `SELECT patient_id AS id, name, phone, citizen_id, email, birth_date,
                        gender, blood_type, allergies, chronic_diseases, current_medications,
                        emergency_contact_name, emergency_contact_phone
                 FROM Patients WHERE patient_id = ?`,
                [req.user.id]
            );

            return res.status(200).json({ message: 'Profile updated successfully.', role: 'patient', profile: updatedRows[0] });
        }

        if (req.user.role === 'doctor') {
            if (!String(name || '').trim() || !String(email || '').trim() || !String(department || '').trim()) {
                return res.status(400).json({ error: 'Please complete doctor name, department, and email.' });
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
                return res.status(400).json({ error: 'Please enter a valid email address.' });
            }

            if (password && String(password).length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters.' });
            }

            const [existingEmail] = await db.execute(
                'SELECT doctor_id FROM Doctors WHERE email = ? AND doctor_id <> ?',
                [String(email).trim(), req.user.id]
            );
            if (existingEmail.length > 0) {
                return res.status(409).json({ error: 'This email is already used by another doctor.' });
            }

            const fields = ['name = ?', 'department = ?', 'email = ?'];
            const values = [String(name).trim(), String(department).trim(), String(email).trim()];

            if (password) {
                fields.push('password = ?');
                values.push(password);
            }

            values.push(req.user.id);

            await db.execute(`UPDATE Doctors SET ${fields.join(', ')} WHERE doctor_id = ?`, values);

            const [updatedRows] = await db.execute(
                `SELECT doctor_id AS id, name, department, email FROM Doctors WHERE doctor_id = ?`,
                [req.user.id]
            );

            return res.status(200).json({ message: 'Profile updated successfully.', role: 'doctor', profile: updatedRows[0] });
        }

        return res.status(403).json({ error: 'Invalid user role.' });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
};

module.exports = { register, login, getProfile, updateProfile };

