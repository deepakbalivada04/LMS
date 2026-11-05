import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { awsConfig } from '../../aws-exports';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { academicService, Assignment, AssignmentSubmission, Quiz, CertificateRecord } from '../../services/academicService';
import { videoUploadService } from '../../services/videoUploadService';
import { UserRecord, UserRole, UserStatus } from '../../types/auth';
import { HardwareProject, ProjectStage, ProjectCategory } from '../../types/course';
import { HlsVideoPlayer } from '../../components/player/HlsVideoPlayer';
import { 
  Shield, 
  Users, 
  BookOpen, 
  Video, 
  FileText, 
  Award, 
  Layers, 
  Plus, 
  Check, 
  Clock, 
  Trash2, 
  Edit3, 
  Search, 
  UploadCloud, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileUp,
  Cpu,
  Eye
} from 'lucide-react';

type AdminTab = 'students' | 'courses' | 'videos' | 'assignments' | 'quizzes_certs';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('students');

  // Core Data Registries
  const [students, setStudents] = useState<UserRecord[]>([]);
  const [projects, setProjects] = useState<HardwareProject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // ----------------------------------------------------
  // Video Management State
  // ----------------------------------------------------
  const [selectedProjectIdForVideo, setSelectedProjectIdForVideo] = useState<string>('crs-esp32-rover');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [newStageTitle, setNewStageTitle] = useState('');
  const [newStageDesc, setNewStageDesc] = useState('');
  const [newStageDuration, setNewStageDuration] = useState(15);
  const [newStageUrl, setNewStageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [activeVideoPreview, setActiveVideoPreview] = useState<string | null>(null);

  // ----------------------------------------------------
  // Course / Learning Path Modal State
  // ----------------------------------------------------
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCategory, setNewCourseCategory] = useState<ProjectCategory>('Robot Kits');
  const [newCourseKit, setNewCourseKit] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // ----------------------------------------------------
  // Assignment Creation / Grading State
  // ----------------------------------------------------
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgCourseId, setNewAsgCourseId] = useState('crs-esp32-rover');
  const [newAsgDueDate, setNewAsgDueDate] = useState('');
  const [newAsgPoints, setNewAsgPoints] = useState(100);
  const [newAsgDesc, setNewAsgDesc] = useState('');
  const [newAsgRubric, setNewAsgRubric] = useState('');

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(95);
  const [gradeFeedback, setGradeFeedback] = useState<string>('');

  // ----------------------------------------------------
  // Certificate Issuance State
  // ----------------------------------------------------
  const [showIssueCertModal, setShowIssueCertModal] = useState(false);
  const [certStudentEmail, setCertStudentEmail] = useState('');
  const [certCourseId, setCertCourseId] = useState('crs-esp32-rover');
  const [certScore, setCertScore] = useState(95);

  // ----------------------------------------------------
  // Student Creation Modal State
  // ----------------------------------------------------
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');

  // Refresh all state from live services
  const refreshAll = () => {
    setStudents(userService.getAllUsers());
    const allProj = projectService.getAllProjects();
    setProjects(allProj);
    if (allProj.length > 0 && !selectedProjectIdForVideo) {
      setSelectedProjectIdForVideo(allProj[0].projectId);
    }
    setAssignments(academicService.getAllAssignments());
    setSubmissions(academicService.getAllSubmissions());
    setQuizzes(academicService.getAllQuizzes());
    setCertificates(academicService.getAllCertificates());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // ----------------------------------------------------
  // Student Approval & Course Allocation Handlers
  // ----------------------------------------------------
  const handleToggleApproval = (student: UserRecord) => {
    const nextStatus: UserStatus = student.status === 'approved' ? 'pending' : 'approved';
    const nextRole: UserRole = nextStatus === 'approved' ? 'student' : 'guest';
    userService.updateUser(student.userId, { status: nextStatus, role: nextRole });
    refreshAll();
  };

  const handleToggleCourseAllocation = (student: UserRecord, courseId: string) => {
    const current = student.enrolledProjectIds || [];
    let updated: string[];
    if (current.includes(courseId)) {
      updated = current.filter((id) => id !== courseId);
    } else {
      updated = [...current, courseId];
    }
    userService.updateUser(student.userId, { enrolledProjectIds: updated });
    refreshAll();
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentEmail) return;
    userService.registerOrUpdateUser({
      name: newStudentName || newStudentEmail.split('@')[0],
      email: newStudentEmail,
    });
    setNewStudentName('');
    setNewStudentEmail('');
    setShowCreateStudentModal(false);
    refreshAll();
  };

  // ----------------------------------------------------
  // Course / Learning Path Creation Handler
  // ----------------------------------------------------
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const cleanId = `crs-${newCourseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    projectService.createProject({
      projectId: cleanId,
      courseId: cleanId,
      title: newCourseTitle,
      category: newCourseCategory,
      hardwareKit: newCourseKit || 'Standard ESP32 & Sensors Lab Kit',
      description: newCourseDesc,
      level: 'Intermediate',
      accentColor: '#4f46e5',
      modules: [],
    });
    setNewCourseTitle('');
    setNewCourseKit('');
    setNewCourseDesc('');
    setShowCreateCourseModal(false);
    refreshAll();
  };

  // ----------------------------------------------------
  // Video Stage Upload / Add Handler
  // ----------------------------------------------------
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageTitle || !selectedProjectIdForVideo) return;

    let finalVideoUrl = newStageUrl;

    if (uploadMode === 'upload' && selectedVideoFile) {
      try {
        setIsUploading(true);
        setUploadProgress(10);
        const uploadResult = await videoUploadService.uploadVideoToS3({
          file: selectedVideoFile,
          projectId: selectedProjectIdForVideo,
          onProgress: (pct: number) => setUploadProgress(pct),
        });
        finalVideoUrl = uploadResult.hlsUrl || uploadResult.s3Url;
      } catch (err: any) {
        alert(`Video upload failed: ${err.message}`);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    if (!finalVideoUrl) {
      alert('Please select a video file or enter an S3/HLS URL.');
      return;
    }

    const cleanStageId = `stg-${Date.now()}`;
    const newStage: ProjectStage = {
      stageId: cleanStageId,
      moduleId: cleanStageId,
      title: newStageTitle,
      description: newStageDesc,
      durationMinutes: Number(newStageDuration) || 15,
      videoUrl: finalVideoUrl,
      hardwareChecklist: [],
      wiringDiagrams: [],
      codeSnippets: [],
    };

    projectService.addStage(selectedProjectIdForVideo, newStage);
    setNewStageTitle('');
    setNewStageDesc('');
    setNewStageUrl('');
    setSelectedVideoFile(null);
    setShowAddStageModal(false);
    refreshAll();
  };

  // ----------------------------------------------------
  // Assignment Creation & Grading Handlers
  // ----------------------------------------------------
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsgTitle || !newAsgCourseId) return;
    const proj = projects.find((p) => p.projectId === newAsgCourseId);
    academicService.createAssignment({
      courseId: newAsgCourseId,
      courseTitle: proj?.title || 'Hardware Lab',
      title: newAsgTitle,
      description: newAsgDesc,
      dueDate: newAsgDueDate || '2026-11-20',
      points: Number(newAsgPoints) || 100,
      rubric: newAsgRubric,
    });
    setNewAsgTitle('');
    setNewAsgDesc('');
    setNewAsgRubric('');
    setShowCreateAssignmentModal(false);
    refreshAll();
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    academicService.gradeSubmission(gradingSubmission.id, gradeScore, gradeFeedback);
    setGradingSubmission(null);
    refreshAll();
  };

  // ----------------------------------------------------
  // Certificate Issuance Handler
  // ----------------------------------------------------
  const handleIssueCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentEmail || !certCourseId) return;
    const student = students.find((s) => s.email.toLowerCase() === certStudentEmail.toLowerCase());
    const proj = projects.find((p) => p.projectId === certCourseId);
    academicService.issueCertificate({
      studentEmail: certStudentEmail,
      studentName: student?.name || certStudentEmail.split('@')[0],
      courseId: certCourseId,
      courseTitle: proj?.title || 'Robotics Specialization',
      score: certScore,
    });
    setShowIssueCertModal(false);
    refreshAll();
  };

  const selectedProjectObj = projects.find((p) => p.projectId === selectedProjectIdForVideo) || projects[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-3">
      {/* ========================================================= */}
      {/* TOP ADMIN HEADER BAR                                      */}
      {/* ========================================================= */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-emerald-400 font-bold">
              Super Administrator Console
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            <span>RoboLMS Academy Control Hub</span>
          </h2>
          <p className="text-xs text-slate-400">
            Live database sync: Manage students, allocate courses, upload S3 video stages, grade assignments, and issue certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Student Portal</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5 ADMIN CONSOLE TABS                                      */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto text-xs font-semibold pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'students'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students & Approvals</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('courses')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'courses'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses & Learning Paths</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold">
            {projects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'videos'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video Stages & S3 Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'assignments'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments & Grading</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-bold">
            {submissions.filter((s) => s.status === 'submitted').length} Pending
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quizzes_certs')}
          className={`pb-3 px-4 transition-all whitespace-nowrap flex items-center gap-2 border-b-2 ${
            activeTab === 'quizzes_certs'
              ? 'text-indigo-600 font-extrabold border-indigo-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Quizzes & Certificates</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
            {certificates.length} Issued
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STUDENTS & APPROVALS                               */}
      {/* ========================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setShowCreateStudentModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Status & Approval</th>
                    <th className="py-3 px-4">Course Allocation (Click to toggle)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter((s) => s.email.toLowerCase().includes(searchQuery.toLowerCase()) || (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => {
                      const isApproved = s.status === 'approved';
                      const enrolled = s.enrolledProjectIds || [];

                      return (
                        <tr key={s.userId} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{s.name || 'Unnamed Student'}</div>
                            <div className="text-[11px] font-mono text-slate-400">{s.email}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleApproval(s)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold transition inline-flex items-center gap-1.5 ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isApproved ? <Check className="w-3 h-3 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                              <span>{isApproved ? 'Approved' : 'Pending Approval (Click to Approve)'}</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {projects.map((p) => {
                                const isAllocated = enrolled.includes(p.projectId);
                                return (
                                  <button
                                    key={p.projectId}
                                    type="button"
                                    onClick={() => handleToggleCourseAllocation(s, p.projectId)}
                                    title={p.title}
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition border ${
                                      isAllocated
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                                    }`}
                                  >
                                    {isAllocated ? '✓ ' : '+ '}
                                    {p.title.length > 20 ? `${p.title.slice(0, 20)}...` : p.title}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <span className="text-[11px] font-mono text-slate-400">
                              {enrolled.length} Assigned
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: COURSES & LEARNING PATHS                           */}
      {/* ========================================================= */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              RoboLMS Curriculum Catalog ({projects.length} Courses)
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateCourseModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Course / Learning Path</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.projectId}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {p.modules?.length || 0} Stages
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {p.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {p.description}
                  </p>

                  <div className="pt-1 text-[11px] font-mono text-slate-400">
                    Kit: <strong className="text-slate-700">{p.hardwareKit}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectIdForVideo(p.projectId);
                      setActiveTab('videos');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <span>Manage Video Stages</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to={`/course/${p.projectId}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    title="Preview Course"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: VIDEO STAGES & S3 UPLOAD                           */}
      {/* ========================================================= */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Course Video Stages
                  </h4>
                  <p className="text-xs text-slate-500">
                    Select a course to view, add, or upload video stages to Amazon S3.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddStageModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Video Stage</span>
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">Select Course</label>
                <select
                  value={selectedProjectIdForVideo}
                  onChange={(e) => setSelectedProjectIdForVideo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.title} ({p.modules?.length || 0} stages)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Stages */}
            <div className="space-y-3">
              {(selectedProjectObj?.modules || []).map((stage, idx) => (
                <div
                  key={stage.stageId}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-start justify-between gap-3 transition hover:border-slate-300"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h5 className="font-bold text-xs text-slate-900 leading-snug">
                        {stage.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {stage.description}
                      </p>
                      <div className="text-[10px] font-mono text-slate-400 truncate">
                        URL: {stage.videoUrl}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveVideoPreview(stage.videoUrl)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Active Video Player Preview */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 sticky top-20">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-600" />
              <span>Video Playback Inspector</span>
            </h4>
            <div className="rounded-xl overflow-hidden bg-black aspect-video border border-slate-800">
              {activeVideoPreview ? (
                <HlsVideoPlayer
                  src={activeVideoPreview}
                  title="Stage Preview"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2 p-6 text-center">
                  <Play className="w-8 h-8 text-slate-600" />
                  <span>Click "Preview" on any stage to inspect live HLS streaming playback.</span>
                </div>
              )}
            </div>
            {activeVideoPreview && (
              <p className="text-[10px] font-mono text-slate-500 break-all">
                Source: {activeVideoPreview}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ASSIGNMENTS & GRADING                              */}
      {/* ========================================================= */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Hardware Lab Assignments & Student Submissions
              </h3>
              <p className="text-xs text-slate-500">
                Create practical build tasks, review student video links, and assign grades with feedback.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateAssignmentModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          {/* Submissions Pending Review */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              Student Submissions ({submissions.length})
            </h4>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
                No student submissions received yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submissions.map((sub) => {
                  const asg = assignments.find((a) => a.id === sub.assignmentId);
                  const isGraded = sub.status === 'graded';

                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isGraded ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                        }`}>
                          {isGraded ? `Graded • ${sub.grade}/100` : 'Pending Review'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-slate-900">{sub.studentName}</h5>
                        <p className="text-[11px] font-mono text-slate-400">{sub.studentEmail}</p>
                      </div>

                      <div className="text-xs text-slate-700">
                        Task: <strong className="text-slate-900">{asg?.title || sub.assignmentId}</strong>
                      </div>

                      {sub.notes && (
                        <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600">
                          "{sub.notes}"
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <a
                          href={sub.submissionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <span>Open Submission URL</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setGradingSubmission(sub);
                            setGradeScore(sub.grade || 95);
                            setGradeFeedback(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
                        >
                          {isGraded ? 'Update Grade' : 'Grade Submission'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: QUIZZES & CERTIFICATES                             */}
      {/* ========================================================= */}
      {activeTab === 'quizzes_certs' && (
        <div className="space-y-6">
          {/* Certificates Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Issued Verified Certificates ({certificates.length})</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issue diplomas to approved students or revoke existing credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIssueCertModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Issue Certificate</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Certificate ID</th>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Issued Date</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-indigo-700">{cert.certificateNumber}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-900 font-bold">{cert.studentName} ({cert.studentEmail})</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{cert.courseTitle}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">{cert.score}%</td>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Revoke certificate ${cert.certificateNumber}?`)) {
                              academicService.revokeCertificate(cert.id);
                              refreshAll();
                            }
                          }}
                          className="text-rose-600 hover:underline font-bold text-xs"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quizzes Bank */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Skill Quiz Bank ({quizzes.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{quiz.title}</span>
                    <span className="font-mono text-slate-400">{quiz.questions.length} Questions</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Time: {quiz.timeLimitMinutes}m &bull; Pass Mark: {quiz.passPercentage}%
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <Link
                      to={`/course/${quiz.courseId}/exam`}
                      className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Test Quiz Player</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS                                                    */}
      {/* ========================================================= */}

      {/* 1. Create Student Modal */}
      {showCreateStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Register New Student</h4>
              <button onClick={() => setShowCreateStudentModal(false)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address*</label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateStudentModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Create Course Modal */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Add Learning Path / Course</h4>
              <button onClick={() => setShowCreateCourseModal(false)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Robotic Arm 6-DOF Kinematics"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={newCourseCategory}
                  onChange={(e) => setNewCourseCategory(e.target.value as ProjectCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Robot Kits">Robot Kits</option>
                  <option value="Space and Hardware">Space and Hardware</option>
                  <option value="How AI Thinks">How AI Thinks</option>
                  <option value="Prompting and Code">Prompting and Code</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hardware Kit Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. 6x MG996R Servos, PCA9685 PWM Driver, Arduino Mega"
                  value={newCourseKit}
                  onChange={(e) => setNewCourseKit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive description of the hardware project and learning goals..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateCourseModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Video Stage Modal */}
      {showAddStageModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Upload / Add Video Stage</h4>
              <button onClick={() => setShowAddStageModal(false)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <form onSubmit={handleAddStage} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Stage Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage 3: Sonar Trigger Pulse & Echo Timing"
                  value={newStageTitle}
                  onChange={(e) => setNewStageTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Detailed instructions for student assembly or coding in this stage..."
                  value={newStageDesc}
                  onChange={(e) => setNewStageDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Upload Mode Switcher */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      checked={uploadMode === 'upload'}
                      onChange={() => setUploadMode('upload')}
                    />
                    <span>Direct File Upload to AWS S3</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="radio"
                      checked={uploadMode === 'url'}
                      onChange={() => setUploadMode('url')}
                    />
                    <span>Existing S3 / HLS URL</span>
                  </label>
                </div>

                {uploadMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-bold file:text-xs hover:file:bg-indigo-500 cursor-pointer"
                    />
                    {isUploading && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>Uploading to S3...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://robotics-lms-videos-processed-2026.s3.ap-southeast-2.amazonaws.com/.../hls/master.m3u8"
                      value={newStageUrl}
                      onChange={(e) => setNewStageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStageModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50">
                  {isUploading ? 'Uploading...' : 'Save Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create Assignment Modal */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Create Hardware Assignment</h4>
              <button onClick={() => setShowCreateAssignmentModal(false)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Course*</label>
                <select
                  value={newAsgCourseId}
                  onChange={(e) => setNewAsgCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assignment Title*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HC-SR04 Voltage Divider Soldering Verification"
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newAsgDueDate}
                    onChange={(e) => setNewAsgDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Points</label>
                  <input
                    type="number"
                    value={newAsgPoints}
                    onChange={(e) => setNewAsgPoints(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Detailed build and testing instructions for the student..."
                  value={newAsgDesc}
                  onChange={(e) => setNewAsgDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateAssignmentModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Grade Submission Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Grade Student Submission</h4>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-800">{gradingSubmission.studentName}</div>
              <a href={gradingSubmission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-[11px] font-mono break-all">
                {gradingSubmission.submissionUrl}
              </a>
            </div>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Awarded Score (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold text-base"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mentor Feedback</label>
                <textarea
                  rows={3}
                  placeholder="Provide technical feedback on the wiring or code implementation..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setGradingSubmission(null)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg">Save Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Issue Certificate Modal */}
      {showIssueCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Issue Verified Certificate</h4>
              <button onClick={() => setShowIssueCertModal(false)} className="text-slate-400 font-bold text-sm">&times;</button>
            </div>
            <form onSubmit={handleIssueCertificate} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Student</label>
                <select
                  value={certStudentEmail}
                  onChange={(e) => setCertStudentEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.userId} value={s.email}>
                      {s.name || s.email} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Course</label>
                <select
                  value={certCourseId}
                  onChange={(e) => setCertCourseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Score Achieved (%)</label>
                <input
                  type="number"
                  min="80"
                  max="100"
                  value={certScore}
                  onChange={(e) => setCertScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowIssueCertModal(false)} className="px-4 py-2 bg-slate-100 rounded-lg font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-lg">Issue Certificate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
