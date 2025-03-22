interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
    {icon && <div className="mb-2 text-green-400">{icon}</div>}
    <h3 className="text-gray-300 text-lg">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);
