import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, ListChecks, BarChart3, Briefcase } from "lucide-react";
import Logo from "../assets/Logo_Inzighted.svg";

const menu = [
	{ label: "Dashboard", icon: <Home className="w-5 h-5" />, href: "/" },
	{ label: "Question Insights", icon: <ListChecks className="w-5 h-5" />, href: "/individual-questions" },
	{ label: "Student Performance", icon: <BarChart3 className="w-5 h-5" />, href: "/performance" },
	{ label: "Class & Batch Trends", icon: <Briefcase className="w-5 h-5" />, href: "/management-drilldown" },
	// { label: "Downloadable Reports", icon: <FileText className="w-5 h-5" />, href: "#" },
	// { label: "System Settings", icon: <Settings className="w-5 h-5" />, href: "#" },
];

const PROFILE = {
	name: "Aaru Mugam",
	role: "Admin",
	email: "aarumugamit@greenpark.com",
	phone: "+91 98765 43210",
	school: "Greenpark International School",
	avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};

function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative animate-fadeIn">
				<button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>
					×
				</button>
				<div className="flex flex-col items-center gap-2">
					<img src={PROFILE.avatar} alt="Profile" className="w-20 h-20 rounded-full shadow mb-2" />
					<div className="font-bold text-lg text-gray-800">{PROFILE.name}</div>
					<div className="text-sm text-gray-500 mb-2">{PROFILE.role}</div>
					<div className="w-full border-t my-2" />
					<div className="w-full flex flex-col gap-1 text-sm">
						<div><span className="font-semibold">Email:</span> {PROFILE.email}</div>
						<div><span className="font-semibold">Phone:</span> {PROFILE.phone}</div>
						<div><span className="font-semibold">School:</span> {PROFILE.school}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function Sidebar() {
	const [profileOpen, setProfileOpen] = useState(false);
	return (
		<aside className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg rounded-tr-2xl rounded-br-2xl p-6 flex flex-col justify-between z-30">
			<div>
				{/* Brand Logo */}
				<NavLink to="/">
					<img src={Logo} alt="InzightEd Logo" className="w-40 mb-8 mx-auto" />
				</NavLink>
				<nav className="flex flex-col gap-y-4 text-gray-700">
					{menu.map((item) => (
						<NavLink
							key={item.label}
							to={item.href}
							className={({ isActive }) =>
								`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
									isActive
										? "bg-blue-100 text-blue-700 font-semibold"
										: "text-gray-700 hover:bg-gray-100"
								}
								`}
						>
							{item.icon} {item.label}
						</NavLink>
					))}
				</nav>
			</div>
			{/* Profile Section */}
			<div className="mt-8 flex flex-col items-center border-t pt-6">
				<img src={PROFILE.avatar} alt="Profile" className="w-14 h-14 rounded-full mb-2 shadow" />
				<div className="font-semibold text-gray-800">{PROFILE.name}</div>
				<div className="text-xs text-gray-500">{PROFILE.role}</div>
				<button className="mt-3 px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition" onClick={() => setProfileOpen(true)}>View Profile</button>
			</div>
			<ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
		</aside>
	);
}
