'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Download, FileText, User, Briefcase, GraduationCap, Award, Mail, Eye, Plus, X, FileDown, FileImage } from 'lucide-react'
import dynamic from 'next/dynamic'

// Note: jsPDF and html2canvas will be imported dynamically in the functions where they're used
// install jspdf html2canvas puppeteer pizzip docxtemplater for ResumeBuilder to work well.

interface PersonalInfo {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
    website: string
    linkedin: string
    github: string
    summary: string
}

interface Experience {
    id: string
    jobTitle: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
}

interface Education {
    id: string
    degree: string
    institution: string
    location: string
    graduationDate: string
    gpa?: string
}

interface Skill {
    id: string
    category: string
    skills: string[]
}

interface Certification {
    id: string
    name: string
    issuer: string
    date: string
    expiryDate?: string
}

// localStorage keys - defined outside component to avoid dependency issues
const STORAGE_KEYS = {
    personalInfo: 'resumeBuilder_personalInfo',
    experiences: 'resumeBuilder_experiences',
    education: 'resumeBuilder_education',
    skills: 'resumeBuilder_skills',
    certifications: 'resumeBuilder_certifications',
    activeTab: 'resumeBuilder_activeTab'
}

// Helper functions for localStorage
const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.error('Error saving to localStorage:', error)
    }
}

const loadFromStorage = (key: string, defaultValue: any) => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem(key)
            return saved ? JSON.parse(saved) : defaultValue
        } catch (error) {
            console.error('Error loading from localStorage:', error)
            return defaultValue
        }
    }
}

const ResumeBuilder = () => {
    // Initialize state with data from localStorage
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(() =>
        loadFromStorage(STORAGE_KEYS.personalInfo, {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            website: '',
            linkedin: '',
            github: '',
            summary: ''
        })
    )

    const [experiences, setExperiences] = useState<Experience[]>(() =>
        loadFromStorage(STORAGE_KEYS.experiences, [])
    )

    const [education, setEducation] = useState<Education[]>(() =>
        loadFromStorage(STORAGE_KEYS.education, [])
    )

    const [skills, setSkills] = useState<Skill[]>(() =>
        loadFromStorage(STORAGE_KEYS.skills, [])
    )

    const [certifications, setCertifications] = useState<Certification[]>(() =>
        loadFromStorage(STORAGE_KEYS.certifications, [])
    )

    const [activeTab, setActiveTab] = useState(() =>
        loadFromStorage(STORAGE_KEYS.activeTab, 'personal')
    )

    // Auto-save to localStorage whenever state changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.personalInfo, personalInfo)
    }, [personalInfo])

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.experiences, experiences)
    }, [experiences])

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.education, education)
    }, [education])

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.skills, skills)
    }, [skills])

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.certifications, certifications)
    }, [certifications])

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.activeTab, activeTab)
    }, [activeTab])

    // Clear all data function
    const clearAllData = () => {
        if (confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key)
            })

            // Reset all state
            setPersonalInfo({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                website: '',
                linkedin: '',
                github: '',
                summary: ''
            })
            setExperiences([])
            setEducation([])
            setSkills([])
            setCertifications([])
            setActiveTab('personal')
        }
    }

    // Add new experience
    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            jobTitle: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }
        setExperiences([...experiences, newExp])
    }

    // Update experience
    const updateExperience = (id: string, field: keyof Experience, value: any) => {
        setExperiences(experiences.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        ))
    }

    // Add new education
    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            degree: '',
            institution: '',
            location: '',
            graduationDate: '',
            gpa: ''
        }
        setEducation([...education, newEdu])
    }

    // Update education
    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setEducation(education.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        ))
    }

    // Add new skill category
    const addSkillCategory = () => {
        const newSkill: Skill = {
            id: Date.now().toString(),
            category: '',
            skills: []
        }
        setSkills([...skills, newSkill])
    }

    // Update skills
    const updateSkill = (id: string, field: keyof Skill, value: any) => {
        setSkills(skills.map(skill =>
            skill.id === id ? { ...skill, [field]: value } : skill
        ))
    }

    // Add certification
    const addCertification = () => {
        const newCert: Certification = {
            id: Date.now().toString(),
            name: '',
            issuer: '',
            date: '',
            expiryDate: ''
        }
        setCertifications([...certifications, newCert])
    }

    // Update certification
    const updateCertification = (id: string, field: keyof Certification, value: string) => {
        setCertifications(certifications.map(cert =>
            cert.id === id ? { ...cert, [field]: value } : cert
        ))
    }

    // Generate Resume HTML
    const generateResume = () => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${personalInfo.firstName} ${personalInfo.lastName} - Resume</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.6; 
            color: #2c3e50; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .document-container {
            max-width: 850px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
        }
        
        .document-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #3498db, #2980b9, #1abc9c, #16a085);
        }
        
        .header { 
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 50px 60px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1));
            transform: rotate(45deg);
        }
        
        .name { 
            font-size: 3.2em; 
            font-weight: 700; 
            margin-bottom: 15px;
            letter-spacing: -1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .contact-info { 
            display: flex; 
            justify-content: center; 
            gap: 30px; 
            flex-wrap: wrap; 
            font-size: 1.1em;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }
        
        .contact-info span {
            background: rgba(255,255,255,0.15);
            padding: 8px 16px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .main-content {
            padding: 60px;
        }
        
        .section { 
            margin-bottom: 50px;
            position: relative;
        }
        
        .section-title { 
            font-size: 1.8em; 
            font-weight: 700; 
            color: #2c3e50;
            margin-bottom: 30px;
            position: relative;
            padding-left: 20px;
        }
        
        .section-title::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-radius: 3px;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 20px;
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, #3498db, #2980b9);
            border-radius: 1px;
        }
        
        .summary-text {
            font-size: 1.1em;
            line-height: 1.8;
            color: #555;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            padding: 30px;
            border-radius: 12px;
            border-left: 5px solid #3498db;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        
        .experience-item { 
            margin-bottom: 35px;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
            position: relative;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .experience-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(0,0,0,0.12);
        }
        
        .job-title { 
            font-weight: 700; 
            font-size: 1.4em;
            color: #2c3e50;
            margin-bottom: 8px;
        }
        
        .company { 
            color: #3498db; 
            font-weight: 600;
            font-size: 1.1em;
            margin-bottom: 8px;
        }
        
        .date-location { 
            color: #7f8c8d; 
            font-style: italic;
            font-weight: 500;
            margin-bottom: 15px;
            font-size: 0.95em;
        }
        
        .job-description {
            color: #555;
            line-height: 1.7;
            font-size: 1em;
        }
        
        .skills-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 25px;
        }
        
        .skill-category { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .skill-category::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            transform: translate(50%, -50%);
        }
        
        .skill-category-title { 
            font-weight: 700;
            font-size: 1.2em;
            margin-bottom: 15px;
            position: relative;
            z-index: 1;
        }
        
        .skill-list { 
            list-style: none;
            position: relative;
            z-index: 1;
        }
        
        .skill-list li { 
            padding: 6px 0;
            font-weight: 400;
            position: relative;
            padding-left: 20px;
        }
        
        .skill-list li::before {
            content: '▸';
            position: absolute;
            left: 0;
            color: rgba(255,255,255,0.8);
            font-weight: bold;
        }
        
        .education-item {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            border-left: 5px solid #1abc9c;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        
        .cert-item {
            background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 5px solid #e74c3c;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.1);
        }
        
        @media print {
            body { 
                background: white;
                padding: 0;
            }
            .document-container {
                box-shadow: none;
                border-radius: 0;
            }
            .section { page-break-inside: avoid; }
            .experience-item { page-break-inside: avoid; }
        }
        
        @media (max-width: 768px) {
            .header { padding: 30px; }
            .main-content { padding: 30px; }
            .name { font-size: 2.5em; }
            .contact-info { gap: 15px; }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <div class="header">
            <div class="name">${personalInfo.firstName} ${personalInfo.lastName}</div>
            <div class="contact-info">
                <span>📧 ${personalInfo.email}</span>
                <span>📱 ${personalInfo.phone}</span>
                <span>📍 ${personalInfo.city}, ${personalInfo.state}</span>
                ${personalInfo.linkedin ? `<span>💼 LinkedIn</span>` : ''}
                ${personalInfo.website ? `<span>🌐 Portfolio</span>` : ''}
            </div>
        </div>

        <div class="main-content">
            ${personalInfo.summary ? `
            <div class="section">
                <div class="section-title">Professional Summary</div>
                <div class="summary-text">${personalInfo.summary}</div>
            </div>
            ` : ''}

            ${experiences.length > 0 ? `
            <div class="section">
                <div class="section-title">Professional Experience</div>
                ${experiences.map(exp => `
                    <div class="experience-item">
                        <div class="job-title">${exp.jobTitle}</div>
                        <div class="company">${exp.company}</div>
                        <div class="date-location">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate} | ${exp.location}</div>
                        <div class="job-description">${exp.description}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${education.length > 0 ? `
            <div class="section">
                <div class="section-title">Education</div>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="job-title">${edu.degree}</div>
                        <div class="company">${edu.institution}</div>
                        <div class="date-location">${edu.graduationDate} | ${edu.location} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="section">
                <div class="section-title">Technical Skills</div>
                <div class="skills-grid">
                    ${skills.map(skill => `
                        <div class="skill-category">
                            <div class="skill-category-title">${skill.category}</div>
                            <ul class="skill-list">
                                ${skill.skills.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${certifications.length > 0 ? `
            <div class="section">
                <div class="section-title">Certifications</div>
                ${certifications.map(cert => `
                    <div class="cert-item">
                        <div class="job-title">${cert.name}</div>
                        <div class="company">${cert.issuer}</div>
                        <div class="date-location">${cert.date} ${cert.expiryDate ? `- ${cert.expiryDate}` : ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
        `
    }

    // Generate Letterhead HTML
    const generateLetterhead = () => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${personalInfo.firstName} ${personalInfo.lastName} - Professional Letterhead</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            color: #2c3e50;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 40px;
        }
        
        .letterhead-container {
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
        }
        
        .letterhead-header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 60px 80px;
            position: relative;
            overflow: hidden;
        }
        
        .letterhead-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -30%;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .letterhead-header::after {
            content: '';
            position: absolute;
            bottom: -100px;
            left: -100px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .name-letterhead { 
            font-family: 'Playfair Display', serif;
            font-size: 2.8em; 
            font-weight: 700; 
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
            position: relative;
            z-index: 1;
        }
        
        .contact-item {
            background: rgba(255,255,255,0.15);
            padding: 15px 20px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
        }
        
        .contact-icon {
            width: 20px;
            height: 20px;
            opacity: 0.9;
        }
        
        .letterhead-body {
            padding: 80px;
            min-height: 600px;
            background: white;
            position: relative;
        }
        
        .date-section {
            text-align: right;
            margin-bottom: 60px;
            font-size: 1.1em;
            color: #555;
        }
        
        .recipient-section {
            margin-bottom: 50px;
            line-height: 1.8;
            font-size: 1.1em;
            color: #555;
        }
        
        .salutation {
            margin-bottom: 40px;
            font-size: 1.1em;
            font-weight: 500;
            color: #2c3e50;
        }
        
        .letter-content {
            min-height: 300px;
            line-height: 1.8;
            font-size: 1.1em;
            color: #555;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 40px;
            border-radius: 12px;
            border-left: 5px solid #3498db;
            margin-bottom: 50px;
            position: relative;
        }
        
        .letter-content::before {
            content: '"';
            position: absolute;
            top: 15px;
            left: 15px;
            font-size: 3em;
            color: #3498db;
            opacity: 0.3;
            font-family: 'Playfair Display', serif;
        }
        
        .closing-section {
            margin-bottom: 80px;
            font-size: 1.1em;
            color: #555;
        }
        
        .signature-area {
            position: relative;
        }
        
        .signature-line {
            width: 300px;
            height: 2px;
            background: linear-gradient(90deg, #3498db, #2980b9);
            margin-top: 60px;
            margin-bottom: 15px;
            border-radius: 1px;
        }
        
        .signature-name {
            font-size: 1.3em;
            font-weight: 700;
            color: #2c3e50;
            font-family: 'Playfair Display', serif;
        }
        
        .signature-title {
            color: #7f8c8d;
            font-style: italic;
            margin-top: 5px;
        }
        
        .letterhead-footer {
            background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
            color: white;
            padding: 30px 80px;
            text-align: center;
            font-size: 0.9em;
            position: relative;
            overflow: hidden;
        }
        
        .letterhead-footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #3498db, #2980b9, #1abc9c, #16a085);
        }
        
        .footer-content {
            position: relative;
            z-index: 1;
        }
        
        @media print {
            body { 
                background: white;
                padding: 0;
            }
            .letterhead-container {
                box-shadow: none;
            }
            .letterhead-body { min-height: auto; }
        }
        
        @media (max-width: 768px) {
            .letterhead-header { padding: 40px; }
            .letterhead-body { padding: 40px; }
            .letterhead-footer { padding: 20px 40px; }
            .name-letterhead { font-size: 2.2em; }
        }
    </style>
</head>
<body>
    <div class="letterhead-container">
        <div class="letterhead-header">
            <div class="name-letterhead">${personalInfo.firstName} ${personalInfo.lastName}</div>
            
            <div class="contact-grid">
                <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <span>${personalInfo.email}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📱</span>
                    <span>${personalInfo.phone}</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">📍</span>
                    <span>${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}</span>
                </div>
                ${personalInfo.website ? `
                <div class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <span>${personalInfo.website}</span>
                </div>
                ` : ''}
                ${personalInfo.linkedin ? `
                <div class="contact-item">
                    <span class="contact-icon">💼</span>
                    <span>LinkedIn Profile</span>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="letterhead-body">
            <div class="date-section">
                [Date: _____________]
            </div>

            <div class="recipient-section">
                <strong>[Recipient Name]</strong><br>
                [Title/Position]<br>
                [Company/Organization Name]<br>
                [Address]<br>
                [City, State, ZIP Code]
            </div>

            <div class="salutation">
                Dear [Recipient Name / Sir/Madam],
            </div>

            <div class="letter-content">
                <p><strong>Subject:</strong> [Letter Subject/Purpose]</p><br>
                
                <p>I am writing to [state the purpose of your letter]. This professional letterhead template provides a clean, elegant format for your business correspondence.</p><br>
                
                <p>[Main body paragraph 1: Introduce your main point or request. Provide context and relevant details.]</p><br>
                
                <p>[Main body paragraph 2: Elaborate on your points, provide supporting information, or explain your qualifications/experience relevant to the letter's purpose.]</p><br>
                
                <p>[Main body paragraph 3: Conclude with next steps, call to action, or summary of what you're requesting/offering.]</p><br>
                
                <p>Thank you for your time and consideration. I look forward to your response.</p>
            </div>

            <div class="closing-section">
                <p>Sincerely,</p>
            </div>

            <div class="signature-area">
                <div class="signature-line"></div>
                <div class="signature-name">${personalInfo.firstName} ${personalInfo.lastName}</div>
                <div class="signature-title">[Your Title/Position]</div>
            </div>
        </div>

        <div class="letterhead-footer">
            <div class="footer-content">
                <p>This letter is confidential and may contain privileged information. If you are not the intended recipient, please notify the sender immediately and destroy this document.</p>
            </div>
        </div>
    </div>
</body>
</html>
        `
    }

    // Generate CV HTML (more detailed than resume)
    const generateCV = () => {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${personalInfo.firstName} ${personalInfo.lastName} - Curriculum Vitae</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            line-height: 1.7; 
            color: #2c3e50;
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .cv-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 30px 60px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
        }
        
        .cv-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #e74c3c, #f39c12, #f1c40f, #2ecc71, #3498db, #9b59b6);
        }
        
        .cv-header { 
            background: linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%);
            color: white;
            padding: 80px 60px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .cv-header::before {
            content: '';
            position: absolute;
            top: -100px;
            right: -100px;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .cv-header::after {
            content: '';
            position: absolute;
            bottom: -150px;
            left: -150px;
            width: 400px;
            height: 400px;
            background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .cv-name { 
            font-family: 'Crimson Text', serif;
            font-size: 4em; 
            font-weight: 700; 
            margin-bottom: 20px;
            letter-spacing: -2px;
            text-shadow: 0 3px 6px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
        }
        
        .cv-title { 
            font-size: 1.6em; 
            color: rgba(255,255,255,0.9);
            font-style: italic;
            font-weight: 300;
            margin-bottom: 40px;
            position: relative;
            z-index: 1;
        }
        
        .cv-contact-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 20px;
            position: relative;
            z-index: 1;
        }
        
        .cv-contact-item {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: 15px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255,255,255,0.2);
            text-align: center;
            font-weight: 500;
            transition: transform 0.3s ease;
        }
        
        .cv-contact-item:hover {
            transform: translateY(-3px);
            background: rgba(255,255,255,0.2);
        }
        
        .cv-main-content {
            padding: 80px 60px;
        }
        
        .cv-section { 
            margin-bottom: 60px;
            position: relative;
        }
        
        .cv-section-title { 
            font-family: 'Crimson Text', serif;
            font-size: 2.2em; 
            font-weight: 700; 
            color: #1a1a1a;
            margin-bottom: 40px;
            position: relative;
            padding-bottom: 20px;
        }
        
        .cv-section-title::before {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 80px;
            height: 4px;
            background: linear-gradient(90deg, #e74c3c, #f39c12);
            border-radius: 2px;
        }
        
        .cv-section-title::after {
            content: '';
            position: absolute;
            left: 90px;
            bottom: 1px;
            width: 40px;
            height: 2px;
            background: linear-gradient(90deg, #f39c12, #f1c40f);
            border-radius: 1px;
        }
        
        .cv-profile-text {
            font-size: 1.2em;
            line-height: 1.9;
            color: #555;
            background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            padding: 40px;
            border-radius: 20px;
            border-left: 6px solid #e74c3c;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            position: relative;
        }
        
        .cv-profile-text::before {
            content: '❝';
            position: absolute;
            top: 20px;
            left: 20px;
            font-size: 4em;
            color: #e74c3c;
            opacity: 0.3;
            font-family: 'Crimson Text', serif;
        }
        
        .cv-item { 
            margin-bottom: 40px;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.08);
            border-left: 6px solid;
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .cv-item:nth-child(odd) { border-left-color: #3498db; }
        .cv-item:nth-child(even) { border-left-color: #2ecc71; }
        .cv-item:nth-child(3n) { border-left-color: #e74c3c; }
        .cv-item:nth-child(4n) { border-left-color: #f39c12; }
        
        .cv-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 45px rgba(0,0,0,0.12);
        }
        
        .cv-item::before {
            content: '';
            position: absolute;
            top: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .cv-item-title { 
            font-family: 'Crimson Text', serif;
            font-weight: 700; 
            font-size: 1.6em;
            color: #1a1a1a;
            margin-bottom: 12px;
            position: relative;
            z-index: 1;
        }
        
        .cv-item-subtitle { 
            color: #3498db; 
            font-weight: 600;
            font-size: 1.2em;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .cv-item-meta { 
            color: #7f8c8d; 
            font-size: 1em;
            font-weight: 500;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            position: relative;
            z-index: 1;
        }
        
        .cv-item-meta::before {
            content: '📅';
            font-size: 1.2em;
        }
        
        .cv-description { 
            line-height: 1.8;
            font-size: 1.1em;
            color: #555;
            position: relative;
            z-index: 1;
        }
        
        .cv-skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }
        
        .cv-skill-category {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 35px;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.3);
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        
        .cv-skill-category:hover {
            transform: translateY(-8px) scale(1.02);
        }
        
        .cv-skill-category::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .cv-skill-category::after {
            content: '';
            position: absolute;
            bottom: -30px;
            left: -30px;
            width: 120px;
            height: 120px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
        }
        
        .cv-skill-title {
            font-family: 'Crimson Text', serif;
            font-weight: 700;
            font-size: 1.5em;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }
        
        .cv-skill-list {
            list-style: none;
            position: relative;
            z-index: 1;
        }
        
        .cv-skill-list li {
            padding: 10px 0;
            font-weight: 400;
            font-size: 1.1em;
            position: relative;
            padding-left: 30px;
            transition: padding-left 0.3s ease;
        }
        
        .cv-skill-list li:hover {
            padding-left: 40px;
        }
        
        .cv-skill-list li::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: rgba(255,255,255,0.8);
            font-weight: bold;
            transition: transform 0.3s ease;
        }
        
        .cv-skill-list li:hover::before {
            transform: scale(1.2);
        }
        
        @media print {
            body { 
                background: white;
                padding: 0;
            }
            .cv-container {
                box-shadow: none;
                border-radius: 0;
            }
            .cv-section { page-break-inside: avoid; }
            .cv-item { page-break-inside: avoid; }
        }
        
        @media (max-width: 768px) {
            .cv-header { padding: 50px 30px; }
            .cv-main-content { padding: 50px 30px; }
            .cv-name { font-size: 3em; }
            .cv-contact-grid { grid-template-columns: 1fr; }
            .cv-skills-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="cv-container">
        <div class="cv-header">
            <div class="cv-name">${personalInfo.firstName} ${personalInfo.lastName}</div>
            <div class="cv-title">Curriculum Vitae</div>
            <div class="cv-contact-grid">
                <div class="cv-contact-item">📧 ${personalInfo.email}</div>
                <div class="cv-contact-item">📱 ${personalInfo.phone}</div>
                <div class="cv-contact-item">📍 ${personalInfo.address}</div>
                <div class="cv-contact-item">🏙️ ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}</div>
                ${personalInfo.linkedin ? `<div class="cv-contact-item">💼 LinkedIn Profile</div>` : ''}
                ${personalInfo.website ? `<div class="cv-contact-item">🌐 Portfolio Website</div>` : ''}
            </div>
        </div>

        <div class="cv-main-content">
            ${personalInfo.summary ? `
            <div class="cv-section">
                <div class="cv-section-title">Professional Profile</div>
                <div class="cv-profile-text">${personalInfo.summary}</div>
            </div>
            ` : ''}

            ${education.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Academic Background</div>
                ${education.map(edu => `
                    <div class="cv-item">
                        <div class="cv-item-title">${edu.degree}</div>
                        <div class="cv-item-subtitle">${edu.institution}</div>
                        <div class="cv-item-meta">${edu.graduationDate} | ${edu.location} ${edu.gpa ? `| GPA: ${edu.gpa}` : ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${experiences.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Professional Experience</div>
                ${experiences.map(exp => `
                    <div class="cv-item">
                        <div class="cv-item-title">${exp.jobTitle}</div>
                        <div class="cv-item-subtitle">${exp.company}</div>
                        <div class="cv-item-meta">${exp.startDate} - ${exp.current ? 'Present' : exp.endDate} | ${exp.location}</div>
                        <div class="cv-description">${exp.description}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            ${skills.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Core Competencies & Skills</div>
                <div class="cv-skills-grid">
                    ${skills.map(skill => `
                        <div class="cv-skill-category">
                            <div class="cv-skill-title">${skill.category}</div>
                            <ul class="cv-skill-list">
                                ${skill.skills.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${certifications.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Professional Certifications</div>
                ${certifications.map(cert => `
                    <div class="cv-item">
                        <div class="cv-item-title">${cert.name}</div>
                        <div class="cv-item-subtitle">${cert.issuer}</div>
                        <div class="cv-item-meta">${cert.date} ${cert.expiryDate ? `- ${cert.expiryDate}` : ''}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
        `
    }

    // Download function
    const downloadDocument = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // PDF Export Function
    /* const exportToPDF = async (type: 'resume' | 'cv' | 'letterhead') => {
        const { default: jsPDF } = await import('jspdf')
        const { default: html2canvas } = await import('html2canvas')

        let content = ''
        let filename = ''

        switch (type) {
            case 'resume':
                content = generateResume()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_Resume.pdf`
                break
            case 'cv':
                content = generateCV()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_CV.pdf`
                break
            case 'letterhead':
                content = generateLetterhead()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_Letterhead.pdf`
                break
        }

        // Create a temporary div to render the HTML
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = content
        tempDiv.style.position = 'absolute'
        tempDiv.style.left = '-9999px'
        tempDiv.style.top = '0'
        tempDiv.style.width = '210mm' // A4 width
        document.body.appendChild(tempDiv)

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = canvas.width
            const imgHeight = canvas.height
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
            const imgX = (pdfWidth - imgWidth * ratio) / 2
            const imgY = 0

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
            pdf.save(filename)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF. Please try again.')
        } finally {
            document.body.removeChild(tempDiv)
        }
    }
 */
    // Word Export Function (creates a simple HTML-based Word document)
    const exportToWord = (type: 'resume' | 'cv' | 'letterhead') => {
        let content = ''
        let filename = ''

        switch (type) {
            case 'resume':
                content = generateResume()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_Resume.doc`
                break
            case 'cv':
                content = generateCV()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_CV.doc`
                break
            case 'letterhead':
                content = generateLetterhead()
                filename = `${personalInfo.firstName}_${personalInfo.lastName}_Letterhead.doc`
                break
        }

        // Add Word-compatible header
        const wordContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Document</title>
                <!--[if gte mso 9]>
                <xml>
                <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>90</w:Zoom>
                <w:DoNotPromptForConvert/>
                <w:DoNotShowErrors/>
                </w:WordDocument>
                </xml>
                <![endif]-->
            </head>
            ${content.replace('<html>', '').replace('</html>', '')}
            </html>
        `

        const blob = new Blob(['\ufeff', wordContent], {
            type: 'application/msword'
        })

        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: User },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Award },
        { id: 'certifications', label: 'Certifications', icon: FileText }
    ]

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Resume Builder</h1>
                    <p className="text-gray-600 mb-4">Create professional resumes, letterheads, and CVs</p>

                    {/* Instructions 
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                                i
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-blue-800 mb-2">How to Use This Form:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                                    <div>
                                        <strong>1. Fill out the form tabs:</strong> Start with Personal Info (required), then add your Experience, Education, Skills, and Certifications.
                                    </div>
                                    <div>
                                        <strong>2. Watch the live preview:</strong> See how your data appears in real-time on the right side as you type.
                                    </div>
                                    <div>
                                        <strong>3. Generate documents:</strong> Download your Resume, CV, or Letterhead as HTML files ready for printing or PDF conversion.
                                    </div>
                                    <div>
                                        <strong>4. Professional tips:</strong> Use action verbs, quantify achievements, and keep descriptions concise and relevant.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>*/}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Section */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            {/* Tab Navigation */}
                            <div className="flex flex-wrap gap-2 mb-6 border-b">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            <IconComponent size={18} />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Personal Information Tab */}
                            {activeTab === 'personal' && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <User size={24} />
                                        Personal Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="First Name"
                                            value={personalInfo.firstName}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last Name"
                                            value={personalInfo.lastName}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={personalInfo.email}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={personalInfo.phone}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={personalInfo.address}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={personalInfo.city}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={personalInfo.state}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Zip Code"
                                            value={personalInfo.zipCode}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="url"
                                            placeholder="Website (optional)"
                                            value={personalInfo.website}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                        <input
                                            type="url"
                                            placeholder="LinkedIn (optional)"
                                            value={personalInfo.linkedin}
                                            onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                        />
                                    </div>

                                    <textarea
                                        placeholder="Professional Summary - Write 2-3 sentences about your career highlights, key skills, and professional goals. This appears at the top of your resume and CV. Example: 'Experienced software engineer with 5+ years developing web applications using React and Node.js...'"
                                        value={personalInfo.summary}
                                        onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                    />
                                </div>
                            )}

                            {/* Experience Tab */}
                            {activeTab === 'experience' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <Briefcase size={24} />
                                            Professional Experience
                                        </h3>
                                        <button
                                            onClick={addExperience}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Add Experience
                                        </button>
                                    </div>

                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Job Title"
                                                    value={exp.jobTitle}
                                                    onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Company"
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="Location"
                                                value={exp.location}
                                                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input
                                                    type="month"
                                                    placeholder="Start Date"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="month"
                                                    placeholder="End Date"
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                    disabled={exp.current}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400 disabled:bg-gray-100"
                                                />
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`current-${exp.id}`}
                                                        checked={exp.current}
                                                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-600">Current Position</label>
                                                </div>
                                            </div>

                                            <textarea
                                                placeholder="Job Description - Describe your key responsibilities, achievements, and impact in this role. Use action verbs and quantify results where possible. Example: 'Led development of e-commerce platform serving 10,000+ users, resulting in 25% increase in sales...'"
                                                value={exp.description}
                                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                rows={4}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                            />

                                            <button
                                                onClick={() => setExperiences(experiences.filter(e => e.id !== exp.id))}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Experience
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Education Tab */}
                            {activeTab === 'education' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <GraduationCap size={24} />
                                            Education
                                        </h3>
                                        <button
                                            onClick={addEducation}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Add Education
                                        </button>
                                    </div>

                                    {education.map((edu) => (
                                        <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Degree"
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Institution"
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Location"
                                                    value={edu.location}
                                                    onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="month"
                                                    placeholder="Graduation Date"
                                                    value={edu.graduationDate}
                                                    onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="GPA (optional)"
                                                    value={edu.gpa || ''}
                                                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                            </div>

                                            <button
                                                onClick={() => setEducation(education.filter(e => e.id !== edu.id))}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Education
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Skills Tab */}
                            {activeTab === 'skills' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <Award size={24} />
                                            Skills
                                        </h3>
                                        <button
                                            onClick={addSkillCategory}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Add Skill Category
                                        </button>
                                    </div>

                                    {skills.map((skill) => (
                                        <div key={skill.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Skill Category - Examples: 'Programming Languages', 'Web Technologies', 'Tools & Frameworks', 'Soft Skills', 'Languages'"
                                                value={skill.category}
                                                onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                            />

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Skills (press comma or enter to add)</label>

                                                {/* Display existing tags */}
                                                {skill.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {skill.skills.map((skillItem, index) => (
                                                            <span
                                                                key={index}
                                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                                                            >
                                                                {skillItem}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSkills = skill.skills.filter((_, i) => i !== index);
                                                                        updateSkill(skill.id, 'skills', newSkills);
                                                                    }}
                                                                    className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Input field for new skills */}
                                                <input
                                                    type="text"
                                                    placeholder="Type a skill and press comma or enter to add it. Examples: JavaScript, Python, React..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === ',' || e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const input = e.target as HTMLInputElement;
                                                            const value = input.value.trim();

                                                            if (value && !skill.skills.includes(value)) {
                                                                updateSkill(skill.id, 'skills', [...skill.skills, value]);
                                                                input.value = '';
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        // Also add skill when user leaves the field
                                                        const value = e.target.value.trim();
                                                        if (value && !skill.skills.includes(value)) {
                                                            updateSkill(skill.id, 'skills', [...skill.skills, value]);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />

                                                <div className="text-xs text-gray-500">
                                                    Type skills and press comma (,) or Enter to add them as tags. Click × to remove.
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setSkills(skills.filter(s => s.id !== skill.id))}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Skill Category
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Certifications Tab */}
                            {activeTab === 'certifications' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <FileText size={24} />
                                            Certifications
                                        </h3>
                                        <button
                                            onClick={addCertification}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Add Certification
                                        </button>
                                    </div>

                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Certification Name"
                                                    value={cert.name}
                                                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Issuing Organization"
                                                    value={cert.issuer}
                                                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input
                                                    type="month"
                                                    placeholder="Issue Date"
                                                    value={cert.date}
                                                    onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                                <input
                                                    type="month"
                                                    placeholder="Expiry Date (optional)"
                                                    value={cert.expiryDate || ''}
                                                    onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black placeholder:text-neutral-400"
                                                />
                                            </div>

                                            <button
                                                onClick={() => setCertifications(certifications.filter(c => c.id !== cert.id))}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove Certification
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Preview and Download Section */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Download size={24} />
                                Live Preview & Generate
                            </h3>

                            {/* Live Preview Section */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <h4 className="font-semibold mb-3 text-gray-700">Document Preview:</h4>

                                {/* Header Preview */}
                                <div className="mb-4 p-3 bg-white rounded border">
                                    <div className="text-lg font-bold text-blue-600">
                                        {personalInfo.firstName || '[First Name]'} {personalInfo.lastName || '[Last Name]'}
                                    </div>
                                    <div className="text-sm text-gray-600 flex flex-wrap gap-2 mt-1">
                                        <span>{personalInfo.email || '[Email Address]'}</span>
                                        <span>•</span>
                                        <span>{personalInfo.phone || '[Phone Number]'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {personalInfo.city || '[City]'}, {personalInfo.state || '[State]'} {personalInfo.zipCode || '[Zip]'}
                                    </div>
                                </div>

                                {/* Summary Preview */}
                                {(personalInfo.summary || activeTab === 'personal') && (
                                    <div className="mb-3 p-2 bg-white rounded border">
                                        <div className="text-sm font-semibold text-gray-700">Professional Summary</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {personalInfo.summary || '[Enter your professional summary in the Personal Info tab]'}
                                        </div>
                                    </div>
                                )}

                                {/* Experience Preview */}
                                {(experiences.length > 0 || activeTab === 'experience') && (
                                    <div className="mb-3 p-2 bg-white rounded border">
                                        <div className="text-sm font-semibold text-gray-700">Experience</div>
                                        {experiences.length > 0 ? (
                                            experiences.slice(0, 2).map((exp) => (
                                                <div key={exp.id} className="text-xs text-gray-600 mt-1">
                                                    <div className="font-medium">{exp.jobTitle || '[Job Title]'} at {exp.company || '[Company]'}</div>
                                                    <div>{exp.startDate || '[Start]'} - {exp.current ? 'Present' : (exp.endDate || '[End]')}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 mt-1">[Add your work experience in the Experience tab]</div>
                                        )}
                                        {experiences.length > 2 && (
                                            <div className="text-xs text-gray-400 mt-1">... and {experiences.length - 2} more</div>
                                        )}
                                    </div>
                                )}

                                {/* Education Preview */}
                                {(education.length > 0 || activeTab === 'education') && (
                                    <div className="mb-3 p-2 bg-white rounded border">
                                        <div className="text-sm font-semibold text-gray-700">Education</div>
                                        {education.length > 0 ? (
                                            education.slice(0, 1).map((edu) => (
                                                <div key={edu.id} className="text-xs text-gray-600 mt-1">
                                                    <div className="font-medium">{edu.degree || '[Degree]'}</div>
                                                    <div>{edu.institution || '[Institution]'} - {edu.graduationDate || '[Graduation Date]'}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 mt-1">[Add your education in the Education tab]</div>
                                        )}
                                        {education.length > 1 && (
                                            <div className="text-xs text-gray-400 mt-1">... and {education.length - 1} more</div>
                                        )}
                                    </div>
                                )}

                                {/* Skills Preview */}
                                {(skills.length > 0 || activeTab === 'skills') && (
                                    <div className="mb-3 p-2 bg-white rounded border">
                                        <div className="text-sm font-semibold text-gray-700">Skills</div>
                                        {skills.length > 0 ? (
                                            skills.slice(0, 2).map((skill) => (
                                                <div key={skill.id} className="text-xs text-gray-600 mt-1">
                                                    <span className="font-medium">{skill.category || '[Category]'}: </span>
                                                    <span>{skill.skills.length > 0 ? skill.skills.slice(0, 3).join(', ') + (skill.skills.length > 3 ? '...' : '') : '[Skills]'}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 mt-1">[Add your skills in the Skills tab]</div>
                                        )}
                                    </div>
                                )}

                                {/* Certifications Preview */}
                                {(certifications.length > 0 || activeTab === 'certifications') && (
                                    <div className="p-2 bg-white rounded border">
                                        <div className="text-sm font-semibold text-gray-700">Certifications</div>
                                        {certifications.length > 0 ? (
                                            certifications.slice(0, 2).map((cert) => (
                                                <div key={cert.id} className="text-xs text-gray-600 mt-1">
                                                    <div className="font-medium">{cert.name || '[Certification Name]'}</div>
                                                    <div>{cert.issuer || '[Issuer]'} - {cert.date || '[Date]'}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 mt-1">[Add your certifications in the Certifications tab]</div>
                                        )}
                                        {certifications.length > 2 && (
                                            <div className="text-xs text-gray-400 mt-1">... and {certifications.length - 2} more</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Download Buttons */}
                            <div className="space-y-6">
                                {/* Resume Downloads */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <FileText size={18} />
                                        Resume
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => downloadDocument(generateResume(), `${personalInfo.firstName}_${personalInfo.lastName}_Resume.html`)}
                                            className="bg-blue-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as HTML"
                                        >
                                            HTML
                                        </button>
                                        <button
                                            //onClick={() => exportToPDF('resume')}
                                            className="bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as PDF"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => exportToWord('resume')}
                                            className="bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as Word Document"
                                        >
                                            DOC
                                        </button>
                                    </div>
                                </div>

                                {/* CV Downloads */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <GraduationCap size={18} />
                                        Curriculum Vitae
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => downloadDocument(generateCV(), `${personalInfo.firstName}_${personalInfo.lastName}_CV.html`)}
                                            className="bg-green-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-green-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as HTML"
                                        >
                                            HTML
                                        </button>
                                        <button
                                            // onClick={() => exportToPDF('cv')}
                                            className="bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as PDF"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => exportToWord('cv')}
                                            className="bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as Word Document"
                                        >
                                            DOC
                                        </button>
                                    </div>
                                </div>

                                {/* Letterhead Downloads */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Mail size={18} />
                                        Letterhead
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => downloadDocument(generateLetterhead(), `${personalInfo.firstName}_${personalInfo.lastName}_Letterhead.html`)}
                                            className="bg-purple-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-purple-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as HTML"
                                        >
                                            HTML
                                        </button>
                                        <button
                                            //onClick={() => exportToPDF('letterhead')}
                                            className="bg-red-500 text-white py-2 px-3 text-sm rounded-lg hover:bg-red-600 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as PDF"
                                        >
                                            PDF
                                        </button>
                                        <button
                                            onClick={() => exportToWord('letterhead')}
                                            className="bg-blue-600 text-white py-2 px-3 text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                            disabled={!personalInfo.firstName || !personalInfo.lastName}
                                            title="Download as Word Document"
                                        >
                                            DOC
                                        </button>
                                    </div>
                                </div>

                                {/* Export Info */}
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-3">
                                        <Download size={20} className="text-blue-600 mt-0.5" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Export Options:</p>
                                            <ul className="space-y-1 text-xs">
                                                <li><strong>HTML:</strong> Web format, easily viewable and printable</li>
                                                <li><strong>PDF:</strong> Professional format, perfect for sharing</li>
                                                <li><strong>DOC:</strong> Word compatible, editable format</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Indicator */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-semibold mb-2">Completion Status:</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span>Personal Info</span>
                                        <span className={`px-2 py-1 rounded text-xs ${personalInfo.firstName && personalInfo.lastName && personalInfo.email
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {personalInfo.firstName && personalInfo.lastName && personalInfo.email ? 'Complete' : 'Required'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Experience</span>
                                        <span className={`px-2 py-1 rounded text-xs ${experiences.length > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {experiences.length > 0 ? `${experiences.length} Added` : 'Optional'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Education</span>
                                        <span className={`px-2 py-1 rounded text-xs ${education.length > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {education.length > 0 ? `${education.length} Added` : 'Optional'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Skills</span>
                                        <span className={`px-2 py-1 rounded text-xs ${skills.length > 0
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {skills.length > 0 ? `${skills.length} Categories` : 'Optional'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Clear Data Section */}
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h4 className="font-semibold mb-2 text-red-800">Data Management:</h4>
                                <button
                                    onClick={clearAllData}
                                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
                                >
                                    Clear All Data
                                </button>
                                <p className="text-xs text-red-600 mt-2">
                                    Your data is automatically saved as you type. Click above to reset everything.
                                </p>
                            </div>

                            {personalInfo.firstName && personalInfo.lastName && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <strong>Ready to generate:</strong> Documents for {personalInfo.firstName} {personalInfo.lastName}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResumeBuilder
