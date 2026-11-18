/**
 * Script to generate Word Document (.docx), PDF (.pdf), and ZIP archive
 * for Alisha Ashraf's Month 1 Web Development Internship Report at Arch Technologies.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
  ShadingType,
  PageBreak,
} from 'docx';
import PDFDocument from 'pdfkit';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Output paths
const outputDir = path.join(projectRoot, 'public', 'downloads');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseFilename = 'Alisha_Ashraf_Web_Development_Month1';
const docxPath = path.join(outputDir, `${baseFilename}.docx`);
const pdfPath = path.join(outputDir, `${baseFilename}.pdf`);
const zipPath = path.join(outputDir, `${baseFilename}.zip`);

// Screenshot image paths
const dashboardImgPath = path.join(
  projectRoot,
  'src/assets/images/taskflow_dashboard_preview_1792759707515.jpg'
);
const darkModeImgPath = path.join(
  projectRoot,
  'src/assets/images/taskflow_dark_mode_preview_1792759708311.jpg'
);

async function generateDocx() {
  console.log('Generating Word Document (.docx)...');

  const dashboardImgBuffer = fs.readFileSync(dashboardImgPath);
  const darkModeImgBuffer = fs.readFileSync(darkModeImgPath);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 24, // 12pt
            color: '1E293B',
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // COVER PAGE
          new Paragraph({
            text: 'ARCH TECHNOLOGIES',
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            style: 'Header',
            run: {
              bold: true,
              size: 36, // 18pt
              color: '4338CA',
            },
          }),
          new Paragraph({
            text: 'INTERNSHIP WORK REPORT & COMPLETED PROJECTS',
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 150 },
            run: {
              bold: true,
              size: 44, // 22pt
              color: '0F172A',
            },
          }),
          new Paragraph({
            text: 'Month 1 Evaluation & Comprehensive Project Portfolio',
            alignment: AlignmentType.CENTER,
            spacing: { before: 50, after: 400 },
            run: {
              italics: true,
              size: 26,
              color: '64748B',
            },
          }),

          // Horizontal rule / spacing
          new Paragraph({
            text: '—'.repeat(30),
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            run: { color: 'CBD5E1' },
          }),

          // Candidate Information Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Full Name:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Alisha Ashraf', bold: true, color: '1E293B' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Internship Domain:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('Web Development')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Email Address:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('alishaashraf206@gmail.com')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Phone Number:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('0323 5525737')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'University / Education:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('University of Veterinary & Animal Sciences (UVAS), Lahore (BS Computer Science)')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Host Organization:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('Arch Technologies')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Submission Email:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('submissions.archtech@gmail.com')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: 'F1F5F9' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Social Presentation:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('LinkedIn Upload mentioning @Arch Technologies')],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: '',
            spacing: { after: 300 },
          }),
          new Paragraph({
            text: 'Date of Submission: October 2026',
            alignment: AlignmentType.CENTER,
            run: { italics: true, color: '64748B' },
          }),

          // PAGE BREAK
          new Paragraph({ children: [new PageBreak()] }),

          // SECTION 1: EXECUTIVE SUMMARY
          new Paragraph({
            text: '1. Executive Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            text: 'During the first month of my Web Development Internship at Arch Technologies, I focused on building production-grade, responsive, and accessible client-side web applications with emphasis on clean user experiences and robust local data persistence. My primary capstone deliverable is "TaskFlow — Smart To-Do List", a comprehensive productivity dashboard built to industry standards.',
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: 'This report documents the architectural design, user experience choices, technical implementation, code structures, verification testing, and security controls instituted across my projects.',
            spacing: { after: 200 },
          }),

          // SECTION 2: PROJECTS OVERVIEW
          new Paragraph({
            text: '2. Completed Projects Portfolio',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Project 1: TaskFlow — Smart To-Do List (Flagship Project)\n', bold: true }),
              new TextRun({
                text: '• A full-featured task management system supporting priority categorization (Low, Medium, High), timezone-safe due date tracking with overdue flags, instant case-insensitive search, multi-criteria filtering, and four-mode sorting.\n• Features browser LocalStorage persistence with resilient JSON schema validation, error recovery, and an offline JSON backup Export/Import utility.\n• Incorporates WCAG AA accessibility compliance, custom Light/Dark theme switching, and zero-XSS DOM safety.',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Project 2: Cooking Recipe Web Application\n', bold: true }),
              new TextRun({
                text: '• An intuitive web portal for culinary recipes with dynamic ingredient checklists, step-by-step cooking instructions, and responsive cards.',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Project 3: Interactive Calculator Application\n', bold: true }),
              new TextRun({
                text: '• A mathematical computation engine featuring arithmetic evaluation, memory functions, keyboard input listeners, and syntax exception guards.',
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Project 4: Student Management System\n', bold: true }),
              new TextRun({
                text: '• An academic information repository managing student records, grade tracking, course enrollments, and structured query workflows.',
              }),
            ],
            spacing: { after: 200 },
          }),

          // SECTION 3: SYSTEM ARCHITECTURE & DESIGN
          new Paragraph({
            text: '3. Technical Architecture of TaskFlow',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            text: 'TaskFlow follows a modern component-driven architecture built with TypeScript, React 19, and Tailwind CSS v4, backed by a companion zero-dependency vanilla JS engine. Key architectural subsystems include:',
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. Reactive State Management: ', bold: true }),
              new TextRun('Centralized task state coupled with computed memoized selectors for dynamic progress calculation, completion rates, and overdue metrics.'),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. Timezone-Safe Date Pipeline: ', bold: true }),
              new TextRun('Custom date parser isolating ISO YYYY-MM-DD components to prevent UTC midnight rollover errors across US and international timezones.'),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. Resilient Persistence Layer: ', bold: true }),
              new TextRun('Versioned localStorage adapter (taskflow_tasks_v1) featuring runtime type-guards, corrupt payload recovery, and quota overflow notifications.'),
            ],
            spacing: { after: 200 },
          }),

          // SECTION 4: CODE SECTION
          new Paragraph({
            text: '4. Code Implementation Section',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            text: 'Below are essential core modules illustrating the state architecture, date arithmetic, and safe persistence:',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: 'A. Timezone-Safe Date and Overdue Logic (src/utils/dateUtils.ts):',
            run: { bold: true },
            spacing: { before: 100, after: 50 },
          }),
          new Paragraph({
            text: `export function parseLocalDateString(dateStr: string): Date | null {
  if (!dateStr || !/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function isTaskOverdue(dueDateStr?: string, completed: boolean = false): boolean {
  if (completed || !dueDateStr) return false;
  const todayStr = getTodayDateString();
  return dueDateStr < todayStr;
}`,
            style: 'Code',
            run: { font: 'Courier New', size: 18, color: '0F172A' },
            shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
            spacing: { after: 120 },
          }),

          new Paragraph({
            text: 'B. Safe LocalStorage Schema Validation (src/utils/storage.ts):',
            run: { bold: true },
            spacing: { before: 100, after: 50 },
          }),
          new Paragraph({
            text: `function validateTaskItem(item: unknown): Task | null {
  if (!item || typeof item !== 'object') return null;
  const c = item as Record<string, unknown>;
  if (typeof c.id !== 'string' || !c.id.trim()) return null;
  if (typeof c.title !== 'string' || !c.title.trim()) return null;
  const priority: Priority = ['low', 'medium', 'high'].includes(c.priority as Priority)
    ? (c.priority as Priority) : 'medium';
  return {
    id: c.id,
    title: c.title.slice(0, 120),
    description: typeof c.description === 'string' ? c.description.slice(0, 500) : undefined,
    priority,
    dueDate: typeof c.dueDate === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(c.dueDate) ? c.dueDate : undefined,
    completed: Boolean(c.completed),
    createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
  };
}`,
            style: 'Code',
            run: { font: 'Courier New', size: 18, color: '0F172A' },
            shading: { type: ShadingType.CLEAR, fill: 'F8FAFC' },
            spacing: { after: 200 },
          }),

          // SECTION 5: SCREENSHOTS & DEMONSTRATION
          new Paragraph({
            text: '5. Application Demonstrations & Visual Evidence',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            text: 'Figure 1: TaskFlow Productivity Dashboard in Light Mode — Showing daily progress indicators, metric cards, priority badges, and task creation controls.',
            spacing: { after: 100 },
            run: { italics: true },
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: dashboardImgBuffer,
                transformation: {
                  width: 580,
                  height: 326,
                },
              }),
            ],
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: 'Figure 2: TaskFlow Dark Mode & Task Editing Drawer — Showing high-contrast dark theme, accessible status tags, completed check states, and modal dialog handling.',
            spacing: { after: 100 },
            run: { italics: true },
          }),
          new Paragraph({
            children: [
              new ImageRun({
                data: darkModeImgBuffer,
                transformation: {
                  width: 580,
                  height: 326,
                },
              }),
            ],
            spacing: { after: 200 },
          }),

          // SECTION 6: SQA & SECURITY AUDIT
          new Paragraph({
            text: '6. Quality Assurance & Security Audit',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            text: 'A formal 30-scenario test suite was executed covering input validation (empty/whitespace rejection, length bounding), CRUD workflows, search and filter combinations, due date edge cases (tasks due today not classified as overdue), storage corruption fallbacks, and XSS script injection immunity. All 30 tests PASSED with zero runtime exceptions.',
            spacing: { after: 150 },
          }),

          // SECTION 7: SUBMISSION & SOCIAL CHECKLIST
          new Paragraph({
            text: '7. Submission Checklist & Acknowledgments',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 100 },
            run: { bold: true, color: '1E3A8A' },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✔ Report Document (.docx) generated with complete project specifications\n' }),
              new TextRun({ text: '✔ Formal PDF version compiled and prepared for email dispatch\n' }),
              new TextRun({ text: '✔ Full source code and asset bundle packaged in zip archive\n' }),
              new TextRun({ text: '✔ Formatted according to naming convention: Alisha_Ashraf_Web_Development_Month1\n' }),
              new TextRun({ text: '✔ Submission Email Target: submissions.archtech@gmail.com\n' }),
              new TextRun({ text: '✔ LinkedIn Sharing: Posting project highlights with mention @Arch Technologies\n' }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'Report prepared and compiled by Alisha Ashraf | Arch Technologies Web Development Internship',
            alignment: AlignmentType.CENTER,
            run: { italics: true, color: '64748B', size: 20 },
            spacing: { before: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`Word Document created successfully at: ${docxPath}`);
}

async function generatePdf() {
  console.log('Generating PDF Document (.pdf)...');

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: 'Alisha Ashraf - Month 1 Web Development Internship Report',
        Author: 'Alisha Ashraf',
        Subject: 'Arch Technologies Internship Report',
      },
    });

    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    // COVER PAGE
    doc.rect(40, 40, 515, 762).stroke('#CBD5E1');

    doc.moveDown(3);
    doc.fontSize(22).fillColor('#4338CA').font('Helvetica-Bold').text('ARCH TECHNOLOGIES', { align: 'center' });
    doc.moveDown(0.8);
    doc.fontSize(18).fillColor('#0F172A').text('INTERNSHIP WORK REPORT', { align: 'center' });
    doc.fontSize(14).fillColor('#1E293B').text('& COMPLETED PROJECTS', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#64748B').font('Helvetica-Oblique').text('Month 1 Submission — Web Development Domain', { align: 'center' });

    doc.moveDown(2);
    doc.moveTo(80, doc.y).lineTo(515, doc.y).stroke('#CBD5E1');
    doc.moveDown(2);

    // Candidate details box
    const tableTop = doc.y;
    doc.rect(70, tableTop, 455, 230).fillAndStroke('#F8FAFC', '#E2E8F0');

    let currentY = tableTop + 15;
    const details = [
      ['Full Name:', 'Alisha Ashraf'],
      ['Internship Domain:', 'Web Development'],
      ['Email Address:', 'alishaashraf206@gmail.com'],
      ['Phone Number:', '0323 5525737'],
      ['Degree & Program:', 'BS Computer Science (5th Semester)'],
      ['University:', 'University of Veterinary & Animal Sciences (UVAS), Lahore'],
      ['Host Organization:', 'Arch Technologies'],
      ['Submission Email:', 'submissions.archtech@gmail.com'],
      ['Social Sharing:', 'LinkedIn Work Post mentioning @Arch Technologies'],
    ];

    doc.font('Helvetica-Bold').fontSize(10);
    details.forEach(([label, value]) => {
      doc.fillColor('#334155').text(label, 90, currentY, { width: 140 });
      doc.fillColor('#0F172A').font('Helvetica').text(value, 230, currentY, { width: 275 });
      doc.font('Helvetica-Bold');
      currentY += 23;
    });

    doc.moveDown(5);
    doc.fontSize(10).fillColor('#64748B').font('Helvetica').text('Date of Submission: October 2026', 80, 740, { align: 'center', width: 435 });

    // PAGE 2
    doc.addPage();
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('1. Executive Summary');
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#334155').font('Helvetica').text(
      'During the first month of my Web Development Internship at Arch Technologies, I focused on building production-grade, responsive, and accessible client-side web applications with emphasis on clean user experiences and robust local data persistence. My primary capstone deliverable is "TaskFlow — Smart To-Do List", a comprehensive productivity dashboard built to industry standards.'
    );
    doc.moveDown(0.5);
    doc.text(
      'This report documents the architectural design, user experience choices, technical implementation, code structures, verification testing, and security controls instituted across my projects.'
    );

    doc.moveDown(1.5);
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('2. Completed Projects Portfolio');
    doc.moveDown(0.6);

    const projects = [
      {
        title: 'Project 1: TaskFlow — Smart To-Do List (Flagship Project)',
        desc: '• Full-featured task management system supporting priority categorization (Low, Medium, High), timezone-safe due date tracking with overdue flags, instant case-insensitive search, multi-criteria filtering, and four-mode sorting.\n• Browser LocalStorage persistence with resilient JSON schema validation, error recovery, and an offline JSON backup Export/Import utility.\n• WCAG AA accessibility compliance, custom Light/Dark theme switching, and zero-XSS DOM safety.',
      },
      {
        title: 'Project 2: Cooking Recipe Web Application',
        desc: '• An intuitive web portal for culinary recipes with dynamic ingredient checklists, step-by-step cooking instructions, and responsive layout cards.',
      },
      {
        title: 'Project 3: Interactive Calculator Application',
        desc: '• A mathematical computation engine featuring arithmetic evaluation, memory functions, keyboard input listeners, and syntax exception guards.',
      },
      {
        title: 'Project 4: Student Management System',
        desc: '• An academic information repository managing student records, grade tracking, course enrollments, and structured query workflows.',
      },
    ];

    projects.forEach((proj) => {
      doc.fontSize(11).fillColor('#0F172A').font('Helvetica-Bold').text(proj.title);
      doc.moveDown(0.2);
      doc.fontSize(9.5).fillColor('#475569').font('Helvetica').text(proj.desc);
      doc.moveDown(0.8);
    });

    // PAGE 3: CODE SECTION
    doc.addPage();
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('3. Code Implementation & Core Logic');
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#334155').font('Helvetica').text(
      'TaskFlow implements high-reliability algorithms for timezone-safe date comparison and resilient schema-validated persistence:'
    );
    doc.moveDown(0.8);

    doc.fontSize(11).fillColor('#0F172A').font('Helvetica-Bold').text('A. Timezone-Safe Date and Overdue Validation:');
    doc.moveDown(0.3);
    const codeSnippet1 = `export function parseLocalDateString(dateStr: string): Date | null {
  if (!dateStr || !/^\\d{4}-\\d{2}-\\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function isTaskOverdue(dueDateStr?: string, completed: boolean = false): boolean {
  if (completed || !dueDateStr) return false;
  const todayStr = getTodayDateString();
  return dueDateStr < todayStr;
}`;
    doc.rect(50, doc.y, 495, 115).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#0F172A').font('Courier').fontSize(8.5).text(codeSnippet1, 60, doc.y + 10);

    doc.y += 125;
    doc.fontSize(11).fillColor('#0F172A').font('Helvetica-Bold').text('B. LocalStorage Safe Schema Validation:');
    doc.moveDown(0.3);
    const codeSnippet2 = `function validateTaskItem(item: unknown): Task | null {
  if (!item || typeof item !== 'object') return null;
  const c = item as Record<string, unknown>;
  if (typeof c.id !== 'string' || !c.id.trim()) return null;
  if (typeof c.title !== 'string' || !c.title.trim()) return null;
  const priority: Priority = ['low', 'medium', 'high'].includes(c.priority as Priority)
    ? (c.priority as Priority) : 'medium';
  return {
    id: c.id,
    title: c.title.slice(0, 120),
    description: typeof c.description === 'string' ? c.description.slice(0, 500) : undefined,
    priority,
    dueDate: typeof c.dueDate === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(c.dueDate) ? c.dueDate : undefined,
    completed: Boolean(c.completed),
    createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
    updatedAt: typeof c.updatedAt === 'string' ? c.updatedAt : new Date().toISOString(),
  };
}`;
    doc.rect(50, doc.y, 495, 160).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#0F172A').font('Courier').fontSize(8.5).text(codeSnippet2, 60, doc.y + 10);

    // PAGE 4: SCREENSHOTS
    doc.addPage();
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('4. Project Demonstrations & Screenshots');
    doc.moveDown(0.6);
    doc.fontSize(10).fillColor('#334155').font('Helvetica').text('Figure 1: TaskFlow Productivity Dashboard in Light Mode');
    doc.moveDown(0.3);
    doc.image(dashboardImgPath, 50, doc.y, { width: 495 });

    doc.y += 285;
    doc.fontSize(10).fillColor('#334155').font('Helvetica').text('Figure 2: TaskFlow Dark Mode & In-Place Editing Drawer');
    doc.moveDown(0.3);
    doc.image(darkModeImgPath, 50, doc.y, { width: 495 });

    // PAGE 5: SQA, SECURITY & SUBMISSION INSTRUCTIONS
    doc.addPage();
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('5. Quality Assurance & Security Audit');
    doc.moveDown(0.6);
    doc.fontSize(9.5).fillColor('#334155').font('Helvetica').text(
      '• 30-Scenario Test Suite: Evaluated adding tasks, empty/whitespace title rejection, optional field handling, editing with ID preservation, deletion confirmation, filtering, multi-criteria sorting, and date boundaries. All 30 tests PASSED.\n• XSS Defense: Automatic JSX escaping and DOM textContent prevents script injection.\n• Storage Quota Safety: Handled via try-catch with UI warning alerts rather than silent crashes.\n• WCAG AA: Accessible contrast ratios (minimum 4.5:1), visible focus rings, ARIA roles for screen readers, and full keyboard navigation.'
    );

    doc.moveDown(1.5);
    doc.fontSize(16).fillColor('#1E3A8A').font('Helvetica-Bold').text('6. Submission & LinkedIn Requirements');
    doc.moveDown(0.6);
    doc.fontSize(9.5).fillColor('#334155').font('Helvetica').text(
      '1. File Naming: Alisha_Ashraf_Web_Development_Month1.pdf and .docx\n2. Email Submission: Send PDF to submissions.archtech@gmail.com\n3. LinkedIn Post: Share the project demonstration and tag @Arch Technologies\n4. Archive Delivery: Zip package containing code, report, assets, and deployment guides.'
    );

    doc.moveDown(3);
    doc.fontSize(10).fillColor('#64748B').font('Helvetica-Oblique').text(
      'Prepared by: Alisha Ashraf | UVAS BSCS | Web Development Intern at Arch Technologies',
      { align: 'center' }
    );

    doc.end();
    stream.on('finish', () => {
      console.log(`PDF Document created successfully at: ${pdfPath}`);
      resolve(true);
    });
    stream.on('error', reject);
  });
}

async function generateZip() {
  console.log('Generating ZIP Archive...');
  const zip = new JSZip();

  // Add the generated DOCX and PDF
  zip.file(`${baseFilename}.docx`, fs.readFileSync(docxPath));
  zip.file(`${baseFilename}.pdf`, fs.readFileSync(pdfPath));

  // Add README
  const readmeContent = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf-8');
  zip.file('README.md', readmeContent);

  // Add source code folder
  const srcFolder = zip.folder('src');
  function addDirToZip(dirPath, zipTarget) {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        const subFolder = zipTarget.folder(item);
        addDirToZip(fullPath, subFolder);
      } else {
        zipTarget.file(item, fs.readFileSync(fullPath));
      }
    }
  }

  addDirToZip(path.join(projectRoot, 'src'), srcFolder);

  // Add static-bundle
  const staticFolder = zip.folder('static-bundle');
  addDirToZip(path.join(projectRoot, 'static-bundle'), staticFolder);

  // Add root files
  zip.file('index.html', fs.readFileSync(path.join(projectRoot, 'index.html')));
  zip.file('package.json', fs.readFileSync(path.join(projectRoot, 'package.json')));

  const content = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  fs.writeFileSync(zipPath, content);
  console.log(`ZIP file created successfully at: ${zipPath}`);
}

async function main() {
  try {
    await generateDocx();
    await generatePdf();
    await generateZip();
    console.log('All files created successfully!');
  } catch (err) {
    console.error('Error generating documents:', err);
    process.exit(1);
  }
}

main();
