import { useEffect } from "react"
import { useRouter } from "next/router"

export default function RedirectCreatePage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin/pages/create-visual')
  }, [router])
  return null
}
