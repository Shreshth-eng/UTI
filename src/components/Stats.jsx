const stats = [
  { value: '100K+', label: 'Active Drivers',       icon: '🚛' },
  { value: '500+',  label: 'Expert Fleet Owners',  icon: '🏢' },
  { value: '95%',   label: 'On-Time Deliveries',   icon: '⚡' },
  { value: '4.9',   label: 'Platform Rating',       icon: '⭐' },
];

const Stats = () => {
  return (
    <section className="px-16 pb-20">
      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="group bg-white/3 border border-white/8 rounded-2xl p-8 text-center hover:bg-white/7 hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <h3 className="text-4xl font-black bg-linear-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-2">
              {stat.value}
            </h3>
            <p className="text-white/45 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
