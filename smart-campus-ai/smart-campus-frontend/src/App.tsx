import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { Navbar } from "./components/Navbar";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { StudentDirectory } from "./components/StudentDirectory";
import { StudentPortal } from "./components/StudentPortal";
import { AdminPortal } from "./components/AdminPortal";
import { StudentProfileModal } from "./components/StudentProfileModal";
import { AddStudentModal } from "./components/AddStudentModal";
import { BulkUploadModal } from "./components/BulkUploadModal";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { PlacementEligibilityView } from "./components/PlacementEligibilityView";
import { NoticeBoardView } from "./components/NoticeBoardView";
import { LandingPage } from "./components/LandingPage";
import { MouseCursorFollower } from "./components/MouseCursorFollower";
import { Student } from "./types";
import { studentsApi } from "./services/api";

export function App() {
  const { user, isLoading } = useAuth();
  
  const [viewMode, setViewModeState] = useState<"landing" | "app">("landing");
  const [targetPortal, setTargetPortalState] = useState<"admin" | "student" | "faculty">("faculty");
  const [currentTab, setCurrentTabState] = useState<string>("overview");
  const [selectedStudent, setSelectedStudentState] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpenState] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpenState] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpenState] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const stateRef = React.useRef({
    viewMode, targetPortal, currentTab, selectedStudent, isAddModalOpen, isBulkModalOpen, isChangePasswordOpen
  });

  React.useEffect(() => {
    stateRef.current = { viewMode, targetPortal, currentTab, selectedStudent, isAddModalOpen, isBulkModalOpen, isChangePasswordOpen };
  }, [viewMode, targetPortal, currentTab, selectedStudent, isAddModalOpen, isBulkModalOpen, isChangePasswordOpen]);

  React.useEffect(() => {
    window.history.replaceState(stateRef.current, "");

    const handlePopState = (e: PopStateEvent) => {
      if (e.state) {
        setViewModeState(e.state.viewMode);
        setTargetPortalState(e.state.targetPortal);
        setCurrentTabState(e.state.currentTab);
        setSelectedStudentState(e.state.selectedStudent);
        setIsAddModalOpenState(e.state.isAddModalOpen);
        setIsBulkModalOpenState(e.state.isBulkModalOpen);
        setIsChangePasswordOpenState(e.state.isChangePasswordOpen);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pushState = (updates: Partial<typeof stateRef.current>) => {
    stateRef.current = { ...stateRef.current, ...updates };
    window.history.pushState(stateRef.current, "");
  };

  const setViewMode = (v: typeof viewMode) => { setViewModeState(v); pushState({ viewMode: v }); };
  const setTargetPortal = (v: typeof targetPortal) => { setTargetPortalState(v); pushState({ targetPortal: v }); };
  const setCurrentTab = (v: typeof currentTab) => { setCurrentTabState(v); pushState({ currentTab: v }); };
  const setSelectedStudent = (v: typeof selectedStudent) => { setSelectedStudentState(v); pushState({ selectedStudent: v }); };
  const setIsAddModalOpen = (v: typeof isAddModalOpen) => { setIsAddModalOpenState(v); pushState({ isAddModalOpen: v }); };
  const setIsBulkModalOpen = (v: typeof isBulkModalOpen) => { setIsBulkModalOpenState(v); pushState({ isBulkModalOpen: v }); };
  const setIsChangePasswordOpen = (v: typeof isChangePasswordOpen) => { setIsChangePasswordOpenState(v); pushState({ isChangePasswordOpen: v }); };

  const handleOpenPortal = (target: "admin" | "student" | "faculty" = "faculty") => {
    setTargetPortalState(target);
    setViewModeState("app");
    pushState({ targetPortal: target, viewMode: "app" });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070d] text-slate-400">
        <MouseCursorFollower />
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Initializing Campus Intelligence Platform...
          </span>
        </div>
      </div>
    );
  }

  // Render landing page if viewMode is 'landing', even if logged in (user may have hit back)
  if (viewMode === "landing") {
    return (
      <>
        <MouseCursorFollower />
        <LandingPage onOpenPortal={handleOpenPortal} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <MouseCursorFollower />
        <LoginPage
          onBackToLanding={() => setViewMode("landing")}
          initialRole={targetPortal === "student" ? "student" : "faculty"}
          initialAdminOpen={targetPortal === "admin"}
        />
      </>
    );
  }

  const handleSelectStudentById = async (id: string) => {
    try {
      const student = await studentsApi.getById(id);
      setSelectedStudent(student);
    } catch (err) {
      console.error("Could not fetch student by id:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 antialiased selection:bg-indigo-500/20 selection:text-indigo-200">
      <MouseCursorFollower />
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onAddStudent={() => setIsAddModalOpen(true)}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenLanding={() => setViewMode("landing")}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {user.role === "admin" ? (
          <AdminPortal
            key={refreshTrigger}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
            onSelectStudent={setSelectedStudent}
            onOpenAddStudent={() => setIsAddModalOpen(true)}
            onOpenBulkUpload={() => setIsBulkModalOpen(true)}
          />
        ) : user.role === "faculty" ? (
          <>
            {currentTab === "overview" ? (
              <FacultyDashboard
                key={refreshTrigger}
                onSelectStudentById={handleSelectStudentById}
                onOpenDirectory={() => setCurrentTab("directory")}
              />
            ) : currentTab === "directory" ? (
              <StudentDirectory
                key={refreshTrigger}
                onSelectStudent={setSelectedStudent}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenBulkModal={() => setIsBulkModalOpen(true)}
              />
            ) : currentTab === "placements" ? (
              <PlacementEligibilityView key={refreshTrigger} />
            ) : (
              <NoticeBoardView isFaculty={true} key={refreshTrigger} />
            )}
          </>
        ) : (
          <StudentPortal />
        )}
      </main>

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => {
            setSelectedStudent(null);
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {/* Add Single Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Bulk CSV Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

    </div>
  );
}

export default App;
