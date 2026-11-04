import React, { useState, useEffect } from 'react';
import { awsConfig } from '../../aws-exports';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { projectService } from '../../services/projectService';
import { videoUploadService } from '../../services/videoUploadService';
import { UserRecord, UserRole } from '../../types/auth';
import { HardwareProject, ProjectStage, HardwareItem } from '../../types/course';
import { HlsVideoPlayer } from '../../components/player/HlsVideoPlayer';
import { 
  Shield, 
  Users, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  Key, 
  Layers, 
  Play, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  X, 
  Cpu, 
  Video, 
  Database, 
  Radio, 
  Award,
  Sparkles,
  ArrowRight,
  Eye,
  Activity,
  FileVideo,
  ListVideo,
  UploadCloud,
  FileUp,
  Film,
  Loader2,
  Link2
} from 'lucide-react';

type AdminTab = 'users' | 'projects' | 'videos' | 'telemetry';

export const AdminDashboard: React.FC = () => {
  const { user, toggleAdminViewMode } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [projects, setProjects] = useState<HardwareProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'student' | 'teacher'>('all');

  // Selected Project for Video Management tab
  const [selectedProjectIdForVideo, setSelectedProjectIdForVideo] = useState<string>('crs-esp32-rover');

  // Modal / Drawer states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showEditStageModal, setShowEditStageModal] = useState(false);

  // Target Project for Add/Edit Stage
  const [targetProjectIdForModal, setTargetProjectIdForModal] = useState<string>('crs-esp32-rover');
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  // S3 Upload API Endpoint state (can be configured via UI or .env)
  const [s3UploadApiUrl, setS3UploadApiUrl] = useState<string>(() => {
    return localStorage.getItem('robolms_s3_upload_api') || awsConfig.getUploadUrlApi || '';
  });

  // Video File Upload State
  const [videoInputMode, setVideoInputMode] = useState<'upload' | 'url'>('upload');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingToS3, setIsUploadingToS3] = useState<boolean>(false);

  // Active Video Preview in Video Management tab
  const [activePreviewStage, setActivePreviewStage] = useState<{
    stageTitle: string;
    videoUrl: string;
    projectTitle: string;
  }>({
    stageTitle: 'Stage 1: Chassis Assembly & Dual Motor Driver Wiring',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    projectTitle: 'Project 1: Autonomous Obstacle-Avoiding Rover Kit',
  });

  // Copy indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedPassCard, setGeneratedPassCard] = useState<{
    name: string;
    email: string;
    role: string;
    tempPass: string;
    projects: string[];
  } | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');
  const [newUserProjects, setNewUserProjects] = useState<string[]>(['crs-esp32-rover']);

  // New Project Form State
  const [newProjId, setNewProjId] = useState('');
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjKit, setNewProjKit] = useState('');
  const [newProjCategory, setNewProjCategory] = useState<'Robotics' | 'Autonomous Vehicles' | 'IoT & Cloud' | 'Kinematics'>('Robotics');
  const [newProjLevel, setNewProjLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newProjColor, setNewProjColor] = useState('#0ea5e9');
  
  // Stage 1 for new project
  const [newProjStage1Title, setNewProjStage1Title] = useState('Stage 1: Core Hardware Assembly & Pinout Verification');
  const [newProjStage1Video, setNewProjStage1Video] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [newProjStage1BOM, setNewProjStage1BOM] = useState('ESP32 Microcontroller (1x), L298N Motor Driver (1x), 7.4V LiPo Battery (1x)');

  // Add / Edit Stage Form State
  const [stageTitle, setStageTitle] = useState('');
  const [stageDesc, setStageDesc] = useState('');
  const [stageVideoUrl, setStageVideoUrl] = useState('');
  const [stageDuration, setStageDuration] = useState(20);
  const [stageBOMText, setStageBOMText] = useState('');

  // Status feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    const loadedUsers = userService.getAllUsers();
    const loadedProjects = projectService.getAllProjects();
    setUsers(loadedUsers);
    setProjects(loadedProjects);

    if (loadedProjects.length > 0 && !loadedProjects.some(p => p.projectId === selectedProjectIdForVideo)) {
      setSelectedProjectIdForVideo(loadedProjects[0].projectId);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingCount = users.filter((u) => u.role === 'guest' || u.status === 'pending').length;

  // Selected project object for Video tab
  const currentVideoProject = projects.find((p) => p.projectId === selectedProjectIdForVideo) || projects[0];

  // Handle Video File Selection
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedVideoFile(file);
    setUploadProgress(0);

    // Auto-detect video duration
    const durationMins = await videoUploadService.detectVideoDuration(file);
    setStageDuration(durationMins);

    // Auto-fill stage title if empty
    if (!stageTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setStageTitle(`Stage: ${cleanName}`);
    }
  };

  // Approve guest -> upgrade to student
  const handleApproveStudent = (email: string) => {
    userService.updateUserRole(email, 'student', 'approved');
    loadData();
    showToast(`Approved ${email} as Enrolled Student! Access unlocked.`);
  };

  // Promote to teacher
  const handlePromoteTeacher = (email: string) => {
    userService.updateUserRole(email, 'teacher', 'approved');
    loadData();
    showToast(`Promoted ${email} to Teacher / Instructor.`);
  };

  // Demote to guest preview
  const handleDemoteGuest = (email: string) => {
    userService.updateUserRole(email, 'guest', 'pending');
    loadData();
    showToast(`Changed ${email} to Guest Preview mode.`);
  };

  // Toggle project enrollment for a student
  const handleToggleEnrollment = (email: string, projectId: string) => {
    const target = users.find((u) => u.email === email);
    if (!target) return;
    const current = target.enrolledProjectIds || [];
    const updated = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId];
    userService.updateUserEnrollments(email, updated);
    loadData();
    showToast(`Updated project enrollments for ${target.name}.`);
  };

  // Delete user
  const handleDeleteUser = (email: string) => {
    if (window.confirm(`Are you sure you want to remove user ${email}?`)) {
      try {
        userService.deleteUser(email);
        loadData();
        showToast(`User ${email} removed.`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Generate / Create User Credentials
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const tempPassword = `RoboPass@${Math.floor(1000 + Math.random() * 9000)}`;

    userService.createUserByAdmin({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      projectIds: newUserProjects,
      notes: `Directly generated by Admin on ${new Date().toLocaleDateString()}`,
    });

    setGeneratedPassCard({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      tempPass: tempPassword,
      projects: newUserProjects,
    });

    loadData();
    setNewUserName('');
    setNewUserEmail('');
    showToast(`Credentials generated for ${newUserName}!`);
  };

  // Create Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjId || !newProjTitle) return;

    const formattedId = newProjId.toLowerCase().startsWith('crs-') ? newProjId : `crs-${newProjId.toLowerCase().replace(/\s+/g, '-')}`;

    const bomItems: HardwareItem[] = newProjStage1BOM.split(',').map((item, idx) => ({
      id: `bom-${Date.now()}-${idx}`,
      name: item.trim(),
      quantity: 1,
      description: 'Physical hardware component included in kit.',
    }));

    const stage1: ProjectStage = {
      stageId: `mod-1`,
      moduleId: `mod-1`,
      title: newProjStage1Title,
      description: 'Follow the hardware video build instructions and verify all sensor/motor pin connections.',
      durationMinutes: 25,
      videoUrl: newProjStage1Video,
      hardwareChecklist: bomItems,
      wiringDiagrams: [
        {
          id: 'wd-init',
          title: 'Initial Power and Logic Rail Wiring',
          diagramType: 'l298n-motor',
          description: 'Establish common ground and connect MCU logic pins.',
          pinConnections: [
            { from: 'MCU 3.3V', to: 'Sensor VCC', signalType: 'Power', color: '#f43f5e' },
            { from: 'MCU GND', to: 'Common Ground Rail', signalType: 'Ground', color: '#64748b' },
          ],
        },
      ],
      codeSnippets: [
        {
          id: 'snip-init',
          filename: 'hardware_selftest.ino',
          language: 'arduino',
          description: 'Microcontroller hardware peripheral self-test loop.',
          code: `void setup() {\n  Serial.begin(115200);\n  Serial.println("Hardware Kit: Self-test initialized successfully!");\n}\n\nvoid loop() {\n  delay(1000);\n}`,
        },
      ],
    };

    const newProject: HardwareProject = {
      projectId: formattedId,
      courseId: formattedId,
      title: newProjTitle,
      description: newProjDesc,
      level: newProjLevel,
      category: newProjCategory,
      hardwareKit: newProjKit || `${newProjTitle} Hardware Kit`,
      accentColor: newProjColor,
      modules: [stage1],
    };

    try {
      projectService.createProject(newProject);
      loadData();
      setShowCreateProjectModal(false);
      showToast(`Created new hardware project "${newProjTitle}"!`);
      setSelectedProjectIdForVideo(formattedId);
      // Reset form
      setNewProjId('');
      setNewProjTitle('');
      setNewProjDesc('');
      setNewProjKit('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Open Add Stage Modal for a specific project
  const openAddStageModal = (projectId: string) => {
    setTargetProjectIdForModal(projectId);
    setStageTitle('');
    setStageDesc('');
    setStageVideoUrl('');
    setSelectedVideoFile(null);
    setUploadProgress(0);
    setVideoInputMode('upload');
    setStageDuration(20);
    setStageBOMText('');
    setShowAddStageModal(true);
  };

  // Open Edit Stage Modal
  const openEditStageModal = (projectId: string, stage: ProjectStage) => {
    setTargetProjectIdForModal(projectId);
    setEditingStageId(stage.stageId || stage.moduleId);
    setStageTitle(stage.title);
    setStageDesc(stage.description);
    setStageVideoUrl(stage.videoUrl);
    setSelectedVideoFile(null);
    setUploadProgress(0);
    setVideoInputMode('url');
    setStageDuration(stage.durationMinutes || 20);
    setStageBOMText(stage.hardwareChecklist.map((h) => h.name).join(', '));
    setShowEditStageModal(true);
  };

  // Submit Add Stage to a specific project (with S3 Video Upload)
  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForModal || !stageTitle) return;

    let finalVideoUrl = stageVideoUrl;

    if (videoInputMode === 'upload') {
      if (!selectedVideoFile) {
        alert('Please choose a video file (.mp4, .mov, .webm) to upload to Amazon S3.');
        return;
      }

      if (s3UploadApiUrl) {
        awsConfig.getUploadUrlApi = s3UploadApiUrl;
      }

      setIsUploadingToS3(true);
      setUploadProgress(5);

      try {
        const uploadResult = await videoUploadService.uploadVideoToS3({
          file: selectedVideoFile,
          projectId: targetProjectIdForModal,
          onProgress: (percent) => setUploadProgress(percent),
        });

        finalVideoUrl = uploadResult.s3Url;
      } catch (err: any) {
        setIsUploadingToS3(false);
        alert(`S3 Upload failed: ${err.message}`);
        return;
      } finally {
        setIsUploadingToS3(false);
      }
    }

    if (!finalVideoUrl) {
      alert('Video file upload or streaming URL is required.');
      return;
    }

    const bomItems: HardwareItem[] = stageBOMText
      ? stageBOMText.split(',').map((item, idx) => ({
          id: `bom-${Date.now()}-${idx}`,
          name: item.trim(),
          quantity: 1,
          description: 'Hardware module required for this video build step.',
        }))
      : [];

    const newStage: ProjectStage = {
      stageId: `mod-${Date.now()}`,
      moduleId: `mod-${Date.now()}`,
      title: stageTitle,
      description: stageDesc || 'Hardware stage build instructions and video tutorial.',
      durationMinutes: stageDuration,
      videoUrl: finalVideoUrl,
      hardwareChecklist: bomItems,
      wiringDiagrams: [],
      codeSnippets: [],
    };

    projectService.addStage(targetProjectIdForModal, newStage);
    loadData();
    setShowAddStageModal(false);

    // Update preview to this new stage
    const proj = projects.find((p) => p.projectId === targetProjectIdForModal);
    setActivePreviewStage({
      stageTitle: newStage.title,
      videoUrl: newStage.videoUrl,
      projectTitle: proj?.title || 'Selected Project',
    });

    showToast(`Video uploaded to S3 and added to ${proj?.title || targetProjectIdForModal}!`);
  };

  // Submit Edit Stage
  const handleSaveEditedStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectIdForModal || !editingStageId) return;

    let finalVideoUrl = stageVideoUrl;

    if (videoInputMode === 'upload' && selectedVideoFile) {
      if (s3UploadApiUrl) {
        awsConfig.getUploadUrlApi = s3UploadApiUrl;
      }
      setIsUploadingToS3(true);
      setUploadProgress(5);
      try {
        const uploadResult = await videoUploadService.uploadVideoToS3({
          file: selectedVideoFile,
          projectId: targetProjectIdForModal,
          onProgress: (percent) => setUploadProgress(percent),
        });
        finalVideoUrl = uploadResult.s3Url;
      } catch (err: any) {
        setIsUploadingToS3(false);
        alert(`S3 Upload failed: ${err.message}`);
        return;
      } finally {
        setIsUploadingToS3(false);
      }
    }

    const bomItems: HardwareItem[] = stageBOMText
      ? stageBOMText.split(',').map((item, idx) => ({
          id: `bom-${Date.now()}-${idx}`,
          name: item.trim(),
          quantity: 1,
          description: 'Hardware component required for this video step.',
        }))
      : [];

    projectService.updateStage(targetProjectIdForModal, editingStageId, {
      title: stageTitle,
      description: stageDesc,
      videoUrl: finalVideoUrl,
      durationMinutes: stageDuration,
      hardwareChecklist: bomItems.length > 0 ? bomItems : undefined,
    });

    loadData();
    setShowEditStageModal(false);

    // Update preview if it was the currently viewed stage
    setActivePreviewStage({
      stageTitle: stageTitle,
      videoUrl: finalVideoUrl,
      projectTitle: currentVideoProject.title,
    });

    showToast(`Saved updates for "${stageTitle}" on S3!`);
  };

  // Delete Stage from Project
  const handleDeleteStage = (projectId: string, stageId: string) => {
    if (window.confirm('Are you sure you want to remove this video stage from this project?')) {
      projectService.deleteStage(projectId, stageId);
      loadData();
      showToast('Video stage removed from project.');
    }
  };

  // Delete project
  const handleDeleteProject = (projectId: string) => {
    if (window.confirm(`Are you sure you want to delete project ${projectId}?`)) {
      projectService.deleteProject(projectId);
      loadData();
      showToast(`Project ${projectId} deleted.`);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full space-y-6">
      {/* ========================================================= */}
      {/* 1. SUPER ADMIN HERO HEADER                                */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 via-sky-500/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>SUPER ADMINISTRATOR CONSOLE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Robotics Lab Operations & Project Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Logged in as <span className="text-emerald-300 font-bold">{user?.email}</span>. Upload video build files directly to Amazon S3, approve students, issue credentials, and configure physical kit stages.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={toggleAdminViewMode}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 font-semibold text-xs flex items-center gap-2 transition"
              title="Preview what students see on their dashboard"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Switch to Student View</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCreateUserModal(true)}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-sky-600/30"
            >
              <Key className="w-4 h-4" />
              <span>Generate Credentials</span>
            </button>

            <button
              type="button"
              onClick={() => openAddStageModal(selectedProjectIdForVideo)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-600/30"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Video to Project</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Total Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{users.length}</div>
          </div>

          <div>
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending Approvals</span>
            </div>
            <div className="text-2xl font-bold text-amber-300 flex items-center gap-2">
              {pendingCount}
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/40">
                  Needs Review
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Hardware Projects</span>
            </div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
          </div>

          <div>
            <div className="text-slate-400 flex items-center gap-1.5 mb-1">
              <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>S3 Video Bucket</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              robotics-lms-videos-2026
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TAB NAVIGATION                                         */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'users'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Student Approvals & Credentials</span>
          {pendingCount > 0 && (
            <span className={`px-2 py-0.5 text-[10px] rounded-full ${
              activeTab === 'users' ? 'bg-white text-sky-600' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'videos'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileVideo className="w-4 h-4" />
          <span>Project Videos & S3 Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'projects'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hardware Kit Projects ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
            activeTab === 'telemetry'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>AWS Architecture Telemetry</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: USER APPROVALS & CREDENTIALS                       */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Generated Pass Card Alert (if generated) */}
          {generatedPassCard && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200 text-slate-800 shadow-sm relative">
              <button
                type="button"
                onClick={() => setGeneratedPassCard(null)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Generated Student Access Passport</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-3 bg-white p-4 rounded-xl border border-sky-100 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Full Name & Email</span>
                  <span className="font-bold text-slate-800">{generatedPassCard.name}</span>
                  <span className="text-slate-500 block truncate">{generatedPassCard.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Role & Temp Password</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold uppercase text-[10px]">
                    {generatedPassCard.role}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-emerald-700">{generatedPassCard.tempPass}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedPassCard.tempPass, 'temp-pass')}
                      className="text-slate-400 hover:text-slate-600"
                      title="Copy Password"
                    >
                      {copiedId === 'temp-pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Enrolled Kits</span>
                  <span className="text-slate-700 block font-sans">
                    {generatedPassCard.projects.length} project(s) assigned
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-semibold">Filter:</span>
              {(['all', 'guest', 'student', 'teacher'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    roleFilter === r
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'guest' ? 'Guests (Pending)' : r}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  Registered Members & Hardware Lab Passports
                </h3>
                <p className="text-xs text-slate-400">
                  Self-registered users join as Guests. Click "Approve as Student" to unlock kit stages and exams.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold font-mono">
                {filteredUsers.length} user(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Member Info</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Kit Enrollments</th>
                    <th className="py-3 px-4 text-right">Admin Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((userRecord) => {
                    const isSelfAdmin = userRecord.email.toLowerCase() === user?.email.toLowerCase();
                    const isPendingGuest = userRecord.role === 'guest' || userRecord.status === 'pending';

                    return (
                      <tr
                        key={userRecord.userId}
                        className={`transition hover:bg-slate-50/80 ${
                          isPendingGuest ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {/* Member Info */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 text-xs">
                            {userRecord.name}
                          </div>
                          <div className="text-slate-400 font-mono text-[11px]">
                            {userRecord.email}
                          </div>
                          {userRecord.notes && (
                            <div className="text-[10px] text-slate-400 mt-0.5 italic">
                              {userRecord.notes}
                            </div>
                          )}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-3">
                          {userRecord.role === 'admin' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                              <Shield className="w-3 h-3 text-emerald-600" />
                              Super Admin
                            </span>
                          )}
                          {userRecord.role === 'student' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px] uppercase">
                              Student
                            </span>
                          )}
                          {userRecord.role === 'teacher' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px] uppercase">
                              Teacher
                            </span>
                          )}
                          {userRecord.role === 'guest' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Guest Preview
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          {userRecord.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Enrolled Projects */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {projects.map((proj) => {
                              const isEnrolled = userRecord.enrolledProjectIds?.includes(proj.projectId);
                              return (
                                <button
                                  key={proj.projectId}
                                  type="button"
                                  disabled={isSelfAdmin}
                                  onClick={() => handleToggleEnrollment(userRecord.email, proj.projectId)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                    isEnrolled
                                      ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-transparent line-through'
                                  }`}
                                  title={isEnrolled ? `Click to unenroll from ${proj.title}` : `Click to enroll in ${proj.title}`}
                                >
                                  {proj.title.split(':')[0]}
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        {/* Approval Actions */}
                        <td className="py-3.5 px-4 text-right">
                          {isSelfAdmin ? (
                            <span className="text-[11px] text-slate-400 italic">Current Session</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Approve as Student */}
                              {userRecord.role !== 'student' && (
                                <button
                                  type="button"
                                  onClick={() => handleApproveStudent(userRecord.email)}
                                  className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                                  title="Approve user and grant Student lab passport"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Approve Student</span>
                                </button>
                              )}

                              {/* Promote to Teacher */}
                              {userRecord.role !== 'teacher' && (
                                <button
                                  type="button"
                                  onClick={() => handlePromoteTeacher(userRecord.email)}
                                  className="py-1 px-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-[11px] border border-purple-200 transition"
                                  title="Make Instructor"
                                >
                                  Teacher
                                </button>
                              )}

                              {/* Demote to Guest */}
                              {userRecord.role !== 'guest' && (
                                <button
                                  type="button"
                                  onClick={() => handleDemoteGuest(userRecord.email)}
                                  className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] transition"
                                  title="Demote to guest preview"
                                >
                                  Guest
                                </button>
                              )}

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(userRecord.email)}
                                className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
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
      {/* TAB 2: PROJECT VIDEOS & S3 UPLOAD                         */}
      {/* ========================================================= */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Top Notice: Clean Project-Scoped Structure */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <UploadCloud className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span>Amazon S3 Direct Video Upload</span>
                  <span className="text-[10px] bg-indigo-200/80 px-2 py-0.5 rounded font-mono text-indigo-800">
                    s3://robotics-lms-videos-2026
                  </span>
                </h4>
                <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                  Select a video file from your computer to upload directly to Amazon S3. The video is set <strong>strictly under your chosen project</strong> and immediately streams in the student learning workbench.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openAddStageModal(selectedProjectIdForVideo)}
              className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Video to this Project</span>
            </button>
          </div>

          {/* Project Switcher Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Project to Manage its S3 Video Curriculum:
              </span>
              <a
                href={`/course/${currentVideoProject.projectId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
              >
                <span>Open in Student View</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Project Tabs Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {projects.map((proj) => {
                const isSelected = proj.projectId === selectedProjectIdForVideo;
                return (
                  <button
                    key={proj.projectId}
                    type="button"
                    onClick={() => {
                      setSelectedProjectIdForVideo(proj.projectId);
                      if (proj.modules.length > 0) {
                        setActivePreviewStage({
                          stageTitle: proj.modules[0].title,
                          videoUrl: proj.modules[0].videoUrl,
                          projectTitle: proj.title,
                        });
                      }
                    }}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.accentColor || '#0ea5e9' }}
                    />
                    <span>{proj.title.split(':')[0]}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {proj.modules.length} video(s)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video List & Live Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Video Stages List for Selected Project */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mb-1">
                    <Cpu className="w-4 h-4" />
                    <span>{currentVideoProject.hardwareKit}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {currentVideoProject.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentVideoProject.modules.length} Video Build Step(s) Configured
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openAddStageModal(currentVideoProject.projectId)}
                  className="py-2 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1.5 transition border border-sky-200 shrink-0"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Upload Video Stage</span>
                </button>
              </div>

              {/* Stages List */}
              <div className="space-y-3">
                {currentVideoProject.modules.map((stage, idx) => {
                  const isCurrentPreview = activePreviewStage.videoUrl === stage.videoUrl;

                  return (
                    <div
                      key={stage.stageId || stage.moduleId || idx}
                      className={`bg-white rounded-2xl p-4 border transition ${
                        isCurrentPreview
                          ? 'border-sky-400 ring-2 ring-sky-100 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isCurrentPreview ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {stage.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {stage.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <Clock className="w-3 h-3 text-sky-500" />
                                {stage.durationMinutes || 20} mins
                              </span>
                              <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                <Cpu className="w-3 h-3 text-emerald-500" />
                                {stage.hardwareChecklist?.length || 0} BOM Part(s)
                              </span>
                              <span className="font-mono text-slate-400 truncate max-w-xs">
                                {stage.videoUrl}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stage Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewStage({
                                stageTitle: stage.title,
                                videoUrl: stage.videoUrl,
                                projectTitle: currentVideoProject.title,
                              });
                            }}
                            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                              isCurrentPreview
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                            title="Preview video stream in player"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span className="hidden sm:inline">Play</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditStageModal(currentVideoProject.projectId, stage)}
                            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition border border-transparent hover:border-slate-200"
                            title="Edit Video or Re-upload"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {currentVideoProject.modules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteStage(currentVideoProject.projectId, stage.stageId || stage.moduleId)}
                              className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition"
                              title="Delete stage"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Embedded Workbench Video Player Preview */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-sky-500 uppercase tracking-wider block">
                    Active Video Preview
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 truncate max-w-xs">
                    {activePreviewStage.stageTitle}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* Video Player */}
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center shadow-inner">
                <HlsVideoPlayer
                  key={activePreviewStage.videoUrl}
                  src={activePreviewStage.videoUrl}
                  title={activePreviewStage.stageTitle}
                />
              </div>

              {/* Video Stream Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Video Storage URL:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(activePreviewStage.videoUrl, 'vid-url')}
                    className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
                  >
                    {copiedId === 'vid-url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <div className="font-mono text-slate-500 break-all text-[10px]">
                  {activePreviewStage.videoUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HARDWARE PROJECTS OVERVIEW                         */}
      {/* ========================================================= */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">
                Hardware Kit Project Catalog
              </h3>
              <p className="text-xs text-slate-400">
                Create new robotics kit projects, add step-by-step video stages, and configure live BOM pinouts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateProjectModal(true)}
              className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Hardware Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.projectId}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      {proj.category}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-medium">
                      {proj.level}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-800 leading-snug mb-1">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {proj.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1 mb-4">
                    <div className="font-semibold text-slate-700 flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-sky-500" />
                      <span>{proj.hardwareKit}</span>
                    </div>
                    <div className="text-slate-400">
                      {proj.modules.length} Build Stage(s) with Video Instructions
                    </div>
                  </div>

                  {/* Stages List */}
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Video Stages
                    </span>
                    {proj.modules.map((mod, idx) => (
                      <div
                        key={mod.stageId || idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50/80 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <Play className="w-3 h-3 text-sky-500 shrink-0" />
                          <span className="font-medium text-slate-700 truncate">{mod.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProjectIdForVideo(proj.projectId);
                            setActivePreviewStage({
                              stageTitle: mod.title,
                              videoUrl: mod.videoUrl,
                              projectTitle: proj.title,
                            });
                            setActiveTab('videos');
                          }}
                          className="text-[10px] text-sky-600 font-bold hover:underline shrink-0"
                        >
                          Manage Video
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectIdForVideo(proj.projectId);
                      openAddStageModal(proj.projectId);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs flex items-center gap-1 transition"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Video Stage</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/course/${proj.projectId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                      title="Open in Lab Workbench"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.projectId)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AWS ARCHITECTURE TELEMETRY                          */}
      {/* ========================================================= */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-sky-600 text-xs font-bold uppercase mb-2">
                <Database className="w-4 h-4" />
                <span>DynamoDB State Machine</span>
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">LMS_Progress</div>
              <div className="text-xs text-slate-400 mt-1">
                Partition Key: <span className="font-mono text-slate-600">userId</span>, Sort Key: <span className="font-mono text-slate-600">courseId</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Single-table design synced with API Gateway
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase mb-2">
                <Users className="w-4 h-4" />
                <span>Cognito User Pool</span>
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">ap-southeast-2_hq8eihEvK</div>
              <div className="text-xs text-slate-400 mt-1">
                Client ID: <span className="font-mono text-slate-600">785fvfqalvbmv8gtdt4999meml</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Direct Frontend Auth (No Secret, SPA Safe)
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase mb-2">
                <UploadCloud className="w-4 h-4" />
                <span>S3 Video Storage</span>
              </div>
              <div className="text-xl font-extrabold text-slate-800 font-mono">robotics-lms-videos-2026</div>
              <div className="text-xs text-slate-400 mt-1">
                Region: <span className="font-mono text-slate-600">ap-southeast-2</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Direct S3 Presigned Upload Pipeline Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD VIDEO LESSON DIRECTLY TO A PROJECT (S3 UPLOAD) */}
      {/* ========================================================= */}
      {showAddStageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              disabled={isUploadingToS3}
              onClick={() => setShowAddStageModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 disabled:opacity-30"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Upload Video to Project
                </h3>
                <p className="text-xs text-slate-400">
                  Video will be uploaded to S3 and attached strictly to this project's curriculum.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStage} className="space-y-4">
              {/* Target Project Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Hardware Project *
                </label>
                <select
                  disabled={isUploadingToS3}
                  value={targetProjectIdForModal}
                  onChange={(e) => setTargetProjectIdForModal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode Toggle: File Upload vs Direct URL */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  disabled={isUploadingToS3}
                  onClick={() => setVideoInputMode('upload')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    videoInputMode === 'upload'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload Video File (S3)</span>
                </button>
                <button
                  type="button"
                  disabled={isUploadingToS3}
                  onClick={() => setVideoInputMode('url')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    videoInputMode === 'url'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Paste S3 / HLS Link</span>
                </button>
              </div>

              {/* MODE 1: FILE UPLOAD ZONE */}
              {videoInputMode === 'upload' && (
                <div className="space-y-3">
                  {/* S3 Upload Endpoint Config Indicator */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Amazon S3 Upload Endpoint (API Gateway)</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s3UploadApiUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s3UploadApiUrl ? 'Connected' : 'Paste Endpoint'}
                      </span>
                    </div>
                    <input
                      type="url"
                      placeholder="https://...execute-api.../getVideoUploadUrl"
                      value={s3UploadApiUrl}
                      disabled={isUploadingToS3}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        setS3UploadApiUrl(val);
                        localStorage.setItem('robolms_s3_upload_api', val);
                        awsConfig.getUploadUrlApi = val;
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    {!s3UploadApiUrl && (
                      <p className="text-[10px] text-amber-700 leading-tight">
                        To upload files to S3, paste your API Gateway endpoint above (e.g. from <code>aws/getUploadUrl/function.zip</code>).
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Video File (.mp4, .mov, .webm) *
                    </label>
                    <div className="p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 rounded-2xl text-center transition cursor-pointer relative">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.mov,.webm,.mkv"
                        disabled={isUploadingToS3}
                        onChange={handleVideoFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-1.5" />
                      {selectedVideoFile ? (
                        <div>
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {selectedVideoFile.name}
                          </span>
                          <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">
                            {videoUploadService.formatBytes(selectedVideoFile.size)} &bull; Ready to upload to S3
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-indigo-900 block">
                            Choose a video file or drag and drop
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Directly uploads to s3://robotics-lms-videos-2026/projects/{targetProjectIdForModal}/
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: DIRECT URL */}
              {videoInputMode === 'url' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct S3 or Streaming URL *
                  </label>
                  <input
                    type="url"
                    disabled={isUploadingToS3}
                    placeholder="https://robotics-lms-videos-2026.s3.ap-southeast-2.amazonaws.com/... or .m3u8"
                    value={stageVideoUrl}
                    onChange={(e) => setStageVideoUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Upload Progress Bar (when uploading) */}
              {isUploadingToS3 && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      Uploading video to Amazon S3...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-indigo-700 block font-mono truncate">
                    Target: s3://robotics-lms-videos-2026/projects/{targetProjectIdForModal}/{selectedVideoFile?.name}
                  </span>
                </div>
              )}

              {/* Video Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Stage / Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={isUploadingToS3}
                  placeholder="e.g. Stage 3: Ultrasonic Spike Rejection & ROS2 Telemetry"
                  value={stageTitle}
                  onChange={(e) => setStageTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Duration in Minutes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  disabled={isUploadingToS3}
                  value={stageDuration}
                  onChange={(e) => setStageDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* BOM Hardware Parts */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hardware Components Used in this Video (Comma-separated)
                </label>
                <input
                  type="text"
                  disabled={isUploadingToS3}
                  placeholder="HC-SR04 Sonar, 1k Resistor, 2k Resistor, Jumper Wires"
                  value={stageBOMText}
                  onChange={(e) => setStageBOMText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Build Instructions / Lesson Description
                </label>
                <textarea
                  rows={2}
                  disabled={isUploadingToS3}
                  placeholder="Step-by-step soldering and wiring notes for this stage..."
                  value={stageDesc}
                  onChange={(e) => setStageDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploadingToS3}
                  onClick={() => setShowAddStageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingToS3}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                >
                  {isUploadingToS3 ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading to S3...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload & Attach to Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT EXISTING PROJECT VIDEO STAGE                  */}
      {/* ========================================================= */}
      {showEditStageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              disabled={isUploadingToS3}
              onClick={() => setShowEditStageModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Edit Project Video Stage
                </h3>
                <p className="text-xs text-slate-400">
                  Upload a new video file to replace on S3 or update stage details.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEditedStage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Video Stage Title
                </label>
                <input
                  type="text"
                  required
                  disabled={isUploadingToS3}
                  value={stageTitle}
                  onChange={(e) => setStageTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* Replace Video File or URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Replace Video File on S3 (Optional)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  disabled={isUploadingToS3}
                  onChange={handleVideoFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Video S3 Storage URL
                </label>
                <input
                  type="url"
                  required
                  disabled={isUploadingToS3}
                  value={stageVideoUrl}
                  onChange={(e) => setStageVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  disabled={isUploadingToS3}
                  value={stageDuration}
                  onChange={(e) => setStageDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  BOM Components (Comma-separated)
                </label>
                <input
                  type="text"
                  disabled={isUploadingToS3}
                  value={stageBOMText}
                  onChange={(e) => setStageBOMText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  disabled={isUploadingToS3}
                  value={stageDesc}
                  onChange={(e) => setStageDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isUploadingToS3}
                  onClick={() => setShowEditStageModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingToS3}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm"
                >
                  {isUploadingToS3 ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW PROJECT KIT                             */}
      {/* ========================================================= */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button
              type="button"
              onClick={() => setShowCreateProjectModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Create Hardware Kit Project
                </h3>
                <p className="text-xs text-slate-400">
                  Define a new robotics track with Bill of Materials and video stages.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Project ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="crs-drone-autopilot"
                    value={newProjId}
                    onChange={(e) => setNewProjId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                  >
                    <option value="Robotics">Robotics</option>
                    <option value="Autonomous Vehicles">Autonomous Vehicles</option>
                    <option value="IoT & Cloud">IoT & Cloud</option>
                    <option value="Kinematics">Kinematics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Project 4: Autonomous Drone with PX4 & ROS2"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hardware Kit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="AeroBot Quad Kit (STM32, Optical Flow, BLDC Motors)"
                  value={newProjKit}
                  onChange={(e) => setNewProjKit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Build and program an autonomous quadcopter using flight controllers, ESCs, and telemetry."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-sky-500"
                />
              </div>

              {/* Stage 1 Config */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Stage 1 Video & Hardware Configuration
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Stage 1 Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newProjStage1Title}
                    onChange={(e) => setNewProjStage1Title(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Video Stream URL (MP4 / HLS .m3u8)
                  </label>
                  <input
                    type="url"
                    required
                    value={newProjStage1Video}
                    onChange={(e) => setNewProjStage1Video(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bill of Materials (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newProjStage1BOM}
                    onChange={(e) => setNewProjStage1BOM(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                >
                  Publish Project Kit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
