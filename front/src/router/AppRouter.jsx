import { Navigate, Route, Routes } from "react-router-dom"

import Home from "../pages/Home"
import Login from "../pages/Login"


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="home" element={<Home />} />

        <Route path="login" element={<Login />} />
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </>
  )
}
