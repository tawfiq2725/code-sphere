export default function LearningPaths() {
  const paths = [
    {
      title: "Fundamentals",
      description:
        "Essential courses for anyone pursuing a career as a professional software engineer.",
      color: "bg-pink-500",
    },
    {
      title: "Front-end Development",
      description:
        "All the courses you need to build beautiful websites: HTML, CSS, JavaScript, React, and more!",
      color: "bg-green-500",
    },
    {
      title: "Back-end Development",
      description:
        "All the courses you need to build powerful APIs for web and mobile apps: Node, Django, ASP.NET.",
      color: "bg-yellow-500",
    },
    {
      title: "Mobile Development",
      description:
        "All the courses you need to build professional, cross-platform mobile apps using React Native.",
      color: "bg-blue-500",
    },
    {
      title: "Game Development",
      description: "The fundamental courses you need to build games.",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-10 py-10">
      <h1 className="text-center text-4xl font-bold mb-6">
        <title>Learning Paths</title>
      </h1>
      <p className="text-center text-gray-300 mb-10 max-w-3xl mx-auto">
        Discover your optimal learning path to reach your full potential.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {paths.map((path, index) => (
          <div
            key={index}
            className={`rounded-lg p-6 shadow-lg ${path.color} text-white`}
          >
            <h2 className="text-xl font-semibold mb-2">{path.title}</h2>
            <p className="text-sm">{path.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
