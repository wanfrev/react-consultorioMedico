import { Navigate, Route, Routes } from "react-router-dom"
import { SidebarComponent } from "../components/SidebarComponent"
import Home from "../pages/Home"

export const AppRoutes = () => {
  return (
    <>
      <SidebarComponent/>
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </>
  )
}
