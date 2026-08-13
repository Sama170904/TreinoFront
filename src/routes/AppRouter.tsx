import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import LoginPage from '../pages/LoginPage';
import ClassSchedulePage from '../pages/ClassSchedulePage';
import MyReservationsPage from '../pages/MyReservationsPage';
import CreditBalanceDashboard from '../pages/CreditBalanceDashboard';
import ProfilePage from '../pages/ProfilePage';
import TeacherClassPage from '../pages/TeacherClassPage';
import TeacherCheckInPage from '../pages/TeacherCheckInPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminSedesPage from '../pages/AdminSedesPage';
import AdminUsuariosPage from '../pages/AdminUsuariosPage';
import { useAuthStore } from '../store/useAuthStore';

const DefaultRedirect: React.FC = () => {
    const usuario = useAuthStore(state => state.usuario);
    if (!usuario) return <Navigate to="/login" replace />;
    if (usuario.rol === 'ADMINISTRADOR') return <Navigate to="/admin" replace />;
    if (usuario.rol === 'PROFESOR') return <Navigate to="/teacher/clases" replace />;
    return <Navigate to="/clases" replace />;
};

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route element={
                    <>
                        <Navbar />
                        <ProtectedRoute />
                    </>
                }>
                    <Route path="/" element={<DefaultRedirect />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Rutas Cliente */}
                    <Route element={<ProtectedRoute allowedRoles={['CLIENTE', 'ADMINISTRADOR']} />}>
                        <Route path="/clases" element={<ClassSchedulePage />} />
                        <Route path="/mis-reservas" element={<MyReservationsPage />} />
                        <Route path="/creditos" element={<CreditBalanceDashboard />} />
                    </Route>

                    {/* Rutas Profesor */}
                    <Route element={<ProtectedRoute allowedRoles={['PROFESOR', 'ADMINISTRADOR']} />}>
                        <Route path="/teacher/clases" element={<TeacherClassPage />} />
                        <Route path="/teacher/check-in" element={<TeacherCheckInPage />} />
                    </Route>

                    {/* Rutas Administrador */}
                    <Route element={<ProtectedRoute allowedRoles={['ADMINISTRADOR']} />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/sedes" element={<AdminSedesPage />} />
                        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
                    </Route>
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
