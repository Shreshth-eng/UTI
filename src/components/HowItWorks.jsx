const steps = [
  {
    num: '01',
    role: 'Receiver',
    color: 'from-blue-600 to-blue-400',
    border: 'border-blue-500/30',
    title: 'Request a Shipment',
    desc: 'Receiver places a goods request with pickup and delivery details on the platform.',
    icon: '📦',
  },
  {
    num: '02',
    role: 'Sender',
    color: 'from-orange-500 to-yellow-400',
    border: 'border-orange-500/30',
    title: 'Create Shipment Order',
    desc: 'Factory owner creates a shipment, sets load details, and posts it to available trucks.',
    icon: '🏭',
  },
  {
    num: '03',
    role: 'Truck Owner',
    color: 'from-purple-500 to-purple-400',
    border: 'border-purple-500/30',
    title: 'Accept & Assign',
    desc: 'Truck owner reviews the order, accepts it, and assigns an available driver.',
    icon: '🚚',
  },
  {
    num: '04',
    role: 'Driver',
    color: 'from-green-500 to-green-400',
    border: 'border-green-500/30',
    title: 'Deliver & Confirm',
    desc: 'Driver picks up goods, updates live status, and marks delivery as complete.',
    icon: '✅',
  },
];

const HowItWorks = () => {
  return (
    <section id="howitworks" className="px-16 pb-24">

      {/* Section Header */}
      <div className="text-center mb-14">
        <p className="text-blue-400 text-xs font-bold tracking-[3px] uppercase mb-3">The Process</p>
        <h2 className="text-4xl font-black text-white mb-4">How UTI Works</h2>
        <p className="text-white/40 text-base max-w-xl mx-auto">
          Four roles, one unified platform. Here's how a delivery happens end-to-end.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-5 relative">

        {/* Connector line */}
        <div className="absolute top-10 left-[12.5%] right-[12.5%] h-px bg-linear-to-r from-blue-500/30 via-orange-500/30 to-green-500/30 hidden lg:block" />

        {steps.map((step, i) => (
          <div
            key={i}
            className={`relative bg-white/3 border ${step.border} rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300 group`}
          >
            {/* Step Number */}
            <div className={`text-xs font-black bg-linear-to-r ${step.color} bg-clip-text text-transparent mb-1`}>
              {step.num}
            </div>

            {/* Icon circle */}
            <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center text-2xl mb-5 opacity-90`}>
              {step.icon}
            </div>

            {/* Role badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-linear-to-r ${step.color} text-white mb-3`}>
              {step.role}
            </span>

            <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
