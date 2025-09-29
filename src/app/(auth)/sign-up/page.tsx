import AuthForm from "@/components/AuthForm";
import SocialProviders from "@/components/SocialProviders";
import Link from "next/link";

export default function SignUpPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="text-center lg:text-left">
				<div className="flex items-center justify-between mb-6">
					<div className="lg:hidden">
						<div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
							<svg
								className="w-5 h-5 text-white"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M24 7.8L6.442 15.276c-1.456.616-2.679-.736-2.679-2.202V10.874C3.763 9.408 4.986 8.056 6.442 8.672L24 16.2V7.8z" />
							</svg>
						</div>
					</div>
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="font-medium text-primary hover:text-primary/80 transition-colors"
						>
							Sign In
						</Link>
					</p>
				</div>
				
				<h1 className="text-3xl font-bold text-foreground mb-2">
					Join Nike Today!
				</h1>
				<p className="text-muted-foreground">
					Create your account to start your fitness journey
				</p>
			</div>

			{/* Social Providers */}
			<SocialProviders mode="signup" />

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t border-border" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or sign up with
					</span>
				</div>
			</div>

			{/* Auth Form */}
			<AuthForm mode="signup" />
		</div>
	);
}
