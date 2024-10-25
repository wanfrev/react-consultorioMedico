import { Navigate, Route, Routes } from "react-router-dom"

import Home from "../pages/Home"
import Login from "../pages/Login"


export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/Home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}
