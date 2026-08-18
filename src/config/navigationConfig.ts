import {
  LayoutGrid,
  CalendarDays,
  HeartPulse,
  Users,
  MessageSquare,
  HelpCircle,
  Settings,
} from "lucide-react";
import { NavigationConfig, UserProfile } from "@/components/navigation/types";

export const doctorNavigationConfig: NavigationConfig = {
  sections: [
    {
      id: "main",
      label: "Main Menu",
      items: [
        { id: "overview", label: "Overview", href: "/doctor/doctors-overview", icon: LayoutGrid },
        { id: "appointments", label: "Appointments", href: "/doctor/appointments", icon: CalendarDays },
        { id: "patients", label: "Patients", href: "/doctor/patients", icon: Users },
        { id: "messages", label: "Messages", href: "/doctor/messages", icon: MessageSquare, badge: 2 },
      ],
    },
    {
      id: "system",
      label: "Preferences",
      items: [
        { id: "help", label: "Help", href: "/doctor/help", icon: HelpCircle },
        { id: "settings", label: "Settings", href: "/doctor/settings", icon: Settings },
      ],
    },
  ],
};

export const patientNavigationConfig: NavigationConfig = {
  sections: [
    {
      id: "main",
      label: "Main Menu",
      items: [
        { id: "overview", label: "Overview", href: "/user/overview", icon: LayoutGrid },
        { id: "appointments", label: "Appointments", href: "/user/appointments", icon: CalendarDays },
        { id: "medical-info", label: "Medical Info", href: "/user/medical-info", icon: HeartPulse },
      ],
    },
    {
      id: "system",
      label: "Preferences",
      items: [
        { id: "help", label: "Help", href: "/user/help", icon: HelpCircle },
        { id: "settings", label: "Settings", href: "/user/settings", icon: Settings },
      ],
    },
  ],
};

export const defaultDoctorUser: UserProfile = {
  id: "doc-1",
  firstname: "Adeyemi",
  lastname: "Stephen",
  email: "dr.stephen@duromtouch.com",
  role: "Consultant Specialist",
  avatar: "/images/stephen.jpg",
};

export const defaultPatientUser: UserProfile = {
  id: "pat-1",
  firstname: "Sarah",
  lastname: "Mitchell",
  email: "sarah.m@gmail.com",
  role: "Patient Account",
  avatar: "/images/sarah_avatar.png",
};
