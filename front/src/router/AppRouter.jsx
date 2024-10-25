import { Route, Routes } from "react-router-dom"

import Login from "../pages/Login"
import { AppRoutes } from "../routes/AppRoutes"


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Aqui va registro y olvido contrasenia */}
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </>
  )
}
