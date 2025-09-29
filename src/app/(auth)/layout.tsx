export default function AuthLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen flex">
			{/* Left side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 bg-dark-900 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-dark-900 to-dark-700" />
				<div className="relative z-10 flex flex-col justify-between p-12 text-white">
					{/* Logo */}
					<div className="flex items-center">
						<div className="w-12 h-12 bg-orange rounded-xl flex items-center justify-center">
							<svg
								className="w-8 h-8 text-white"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M24 7.8L6.442 15.276c-1.456.616-2.679-.736-2.679-2.202V10.874C3.763 9.408 4.986 8.056 6.442 8.672L24 16.2V7.8z" />
							</svg>
						</div>
					</div>

					{/* Main content */}
					<div className="space-y-6">
						<h1 className="text-5xl font-bold leading-tight">
							Just Do It
						</h1>
						<p className="text-xl text-light-400 max-w-md">
							Join millions of athletes and fitness enthusiasts who trust
							Nike for their performance needs.
						</p>
						
						{/* Dots indicator */}
						<div className="flex space-x-2">
							<div className="w-2 h-2 bg-white rounded-full" />
							<div className="w-2 h-2 bg-white/30 rounded-full" />
							<div className="w-2 h-2 bg-white/30 rounded-full" />
						</div>
					</div>

					{/* Footer */}
					<div className="text-light-400 text-sm">
						© 2024 Nike. All rights reserved.
					</div>
				</div>
			</div>

			{/* Right side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8">
				<div className="w-full max-w-md">
					{children}
				</div>
			</div>
		</div>
	);
}
