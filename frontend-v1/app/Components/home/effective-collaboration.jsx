import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Helper component for the decorative dot grid
function DotGrid({ className = "" }) {
  return (
    <div className={`grid grid-cols-7 gap-1.5 ${className}`}>
      {Array.from({ length: 49 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-900 rounded-full"
        ></div>
      ))}
    </div>
  );
}

export function EfficientCollaboration() {
  const avatars = [
    "https://i.pravatar.cc/150?img=1",
    "https://i.pravatar.cc/150?img=2",
    "https://i.pravatar.cc/150?img=3",
    "https://i.pravatar.cc/150?img=4",
    "https://i.pravatar.cc/150?img=5",
  ];

  return (
    <section className="w-full py-16 md:py-32 px-4 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center">

          {/* --- Left Column (Visuals) --- */}
          <div className="relative min-h-[500px] hidden md:block">

            {/* Decorative Dot Grid (z-0, bottom layer) */}
            <DotGrid className="absolute left-0 top-[120px] z-0" />

            {/* Secondary Image Card (Man Writing) (z-10) */}
            <Card className="absolute w-[280px] shadow-lg rounded-2xl left-0 top-[170px] z-10 border-none">
              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjc5fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=800"
                alt="Man writing at desk"
                className="rounded-2xl object-cover w-full h-auto"
              />
            </Card>

            {/* Decorative Yellow Shape (z-20) */}
            <div className="absolute w-[260px] h-[180px] bg-yellow-400 rounded-2xl left-[100px] top-[60px] z-20"></div>

            {/* Main Image Card (Team) (z-30) */}
            <Card className="absolute w-[380px] shadow-xl rounded-2xl left-[120px] top-[110px] z-30 border-none">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjc5fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=800"
                alt="Team collaborating on laptop"
                className="rounded-t-2xl object-cover w-full h-[250px]"
              />
              <CardContent className="p-4 bg-white dark:bg-slate-900 rounded-b-2xl">
                <div className="flex -space-x-2 overflow-hidden">
                  {avatars.map((src, index) => (
                    <Avatar
                      key={index}
                      className="h-9 w-9 border-2 border-white dark:border-slate-800"
                    >
                      <AvatarImage src={src} alt={`User ${index + 1}`} />
                      <AvatarFallback>U{index + 1}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* "Popular" Card (z-40, top layer) */}
            <Card className="absolute w-[280px] shadow-lg rounded-2xl left-[20px] top-0 z-40 bg-white dark:bg-slate-900 border-none">
              <CardContent className="p-5">
                <Badge className="border-blue-300 text-blue-700 bg-blue-100 font-medium">
                  Popular
                </Badge>
                <h4 className="font-semibold text-gray-900 dark:text-white mt-3 text-lg">
                  Design for how people think
                </h4>
                <p className="text-sm text-muted-foreground dark:text-slate-400 mt-1">
                
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile View for Visuals */}
          <div className="md:hidden flex flex-col gap-4">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNjc5fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=800"
              alt="Team collaborating on laptop"
              className="rounded-2xl object-cover w-full h-auto shadow-lg"
            />
          </div>

          {/* --- Right Column (Text Content) --- */}
          <div className="flex flex-col justify-center pt-8 md:pt-0">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Efficient collaboration
            </h2>
            <p className="text-lg text-muted-foreground dark:text-slate-400 leading-relaxed">
         Foster a vibrant and interactive community to enhance student engagement, collaboration, and knowledge sharing
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}