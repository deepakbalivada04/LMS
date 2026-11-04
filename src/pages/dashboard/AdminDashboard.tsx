import React from 'react';
import { Shield, Database, Users, Film, CheckCircle, PlusCircle, Activity } from 'lucide-react';
import { SAMPLE_COURSES } from '../../lib/mockData';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Admin Header */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-3 w-fit">
          <Shield className="w-3.5 h-3.5" />
          <span>INSTRUCTOR & SYSADMIN CONSOLE</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Robotics Curriculum & Telemetry Operations
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          Manage hardware course offerings, monitor student progression through DynamoDB single-table metrics, and review MediaConvert HLS streaming outputs.
        </p>
      </div>

      {/* Cloud Architecture Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>DYNAMODB PROGRESS</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1,420</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" /> Progress Records Synced
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>COGNITO STUDENTS</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">348</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Active Lab Passports</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>HLS STREAM PIPELINE</span>
            <Film className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1080p / 720p</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <Activity className="w-3 h-3" /> MediaConvert Healthy
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>CERTIFICATES ISSUED</span>
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">112</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-mono">AWS S3 Pre-signed URLs</div>
        </div>
      </div>

      {/* Courses Administration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-mono">Course Syllabus & Hardware Specifications</h2>
            <p className="text-xs text-slate-400">Deployed courses mapped to DynamoDB Courses table</p>
          </div>
          <button
            type="button"
            className="py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            Add Hardware Track
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="pb-3 pl-2">Course ID</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Modules</th>
                <th className="pb-3">BOM / Kit</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SAMPLE_COURSES.map((course) => (
                <tr key={course.courseId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 pl-2 text-cyan-400 font-semibold">{course.courseId}</td>
                  <td className="py-3.5 text-slate-200 font-sans font-medium">{course.title}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {course.level}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{course.modules.length} Modules</td>
                  <td className="py-3.5 text-slate-400 font-sans">{course.hardwareKit}</td>
                  <td className="py-3.5 text-right pr-2">
                    <button className="text-cyan-400 hover:text-cyan-300 transition underline underline-offset-4">
                      Edit Schematics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

