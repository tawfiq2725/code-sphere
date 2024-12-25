export function CodeEditor() {
  return (
    <div className="bg-[#1E1E1E] rounded-lg p-4 font-mono text-sm text-gray-300 overflow-hidden">
      <pre className="space-y-2">
        <code>
          <span className="text-purple-400">function</span>{" "}
          <span className="text-blue-400">learnToCode</span>() {"{"}
        </code>
        <code>
          {" "}
          <span className="text-green-400">// Start your journey</span>
        </code>
        <code>
          {" "}
          <span className="text-purple-400">const</span> success ={" "}
          <span className="text-orange-400">true</span>;
        </code>
        <code>
          {" "}
          <span className="text-purple-400">return</span> success;
        </code>
        <code>{"}"}</code>
      </pre>
    </div>
  );
}
