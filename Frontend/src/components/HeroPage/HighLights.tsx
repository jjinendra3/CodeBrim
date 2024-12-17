'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Code, Zap, Globe, Lock } from 'lucide-react'

const features = [
  { icon: Code, title: 'Multiple Languages', description: 'Support for C, C++, JavaScript, Python, Java and Go.' },
  { icon: Zap, title: 'Instant Execution', description: 'Run your code with zero setup time anywhere, anytime!' },
  { icon: Globe, title: 'Hassle Free Cloud Sharing', description: 'Share multiple files through a single universal link hassle-free!' },
  { icon: Lock, title: 'Secure Environment', description: 'Your code and data are always protected' },
]

export default function FeatureHighlights() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className="bg-gray-800 p-6 rounded-lg shadow-lg relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
        >
          <feature.icon className="text-blue-500 w-8 h-8 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-gray-400">{feature.description}</p>
          <motion.div
            className="absolute inset-0 bg-blue-500 opacity-0"
            animate={{ opacity: hoveredIndex === index ? 0.1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      ))}
    </div>
  )
}

