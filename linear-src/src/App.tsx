import { AppProvider, useApp } from "./context";
import { Shell } from "./components/Layout";
import { Landing } from "./pages/Landing";
import { StudentRouter } from "./pages/StudentPages";
import { TeacherRouter } from "./pages/TeacherPages";

function Root() {
  const { role } = useApp();
  if (!role) return <Landing />;
  return <Shell>{role === "teacher" ? <TeacherRouter /> : <StudentRouter />}</Shell>;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
