import { Navigate, Route, Routes } from "react-router-dom"
import RecoverPassword from '../components/RecoveryPassword';
import ResetPassword from '../components/ResetPassword';
import Home from "../pages/Home"
import Login from "../pages/Login"


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} /> /* Ruta de inicio donde empezara la pagina */

        <Route path="/Home" element={<Home />} /> /* Ruta de la pagina principal, despues de hacer login */
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/*" element={<Navigate to="/" />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Routes>
    </>
  )
}
