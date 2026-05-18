import { EduHeader } from '../../components/adminComponents/EduHeader'
import { Outlet } from 'react-router-dom'
import { useEffect, useState } from "react"
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../components/ui/alert"

export function MainLayout() {
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning" | "info"
    message: string
  } | null>(null)

  useEffect(() => {
    if (!alert) return

    const timer = setTimeout(() => {
      setAlert(null)
    }, 3200)

    return () => clearTimeout(timer)
  }, [alert])
   

  return (
    <div className="min-h-screen bg-[#f3f5f7] relative">
      <EduHeader />

      {alert && (
        <Alert variant={alert.type} toast duration={3000}>
          <AlertTitle>
            {alert.type === "success" ? "Thành công" : "Thông báo"}
          </AlertTitle>
          <AlertDescription>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="pt-20">
        <Outlet context={{ setAlert }} />
      </div>
    </div>
  )
}
