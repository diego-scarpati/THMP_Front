'use client'

import { useState } from 'react'
import Skill from '@/components/ui/skill'

const skills = [
  'JavaScript',
  'TypeScript', 
  'React',
  'Next.js',
  'Node.js',
  'CSS',
  'HTML',
  'Python',
  'Java',
  'Git'
]

export default function SkillsExample() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['JavaScript'])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Skills Component Examples</h2>
        
        {/* Static Examples */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Static Examples</h3>
          <div className="flex flex-wrap gap-3">
            <Skill skill="CSS" variant="inactive" />
            <Skill skill="JavaScript" variant="active" />
            <Skill skill="React" variant="hovered" />
          </div>
        </div>

        {/* Different Sizes */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Different Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Skill skill="Small" variant="active" size="sm" />
            <Skill skill="Medium" variant="active" size="md" />
            <Skill skill="Large" variant="active" size="lg" />
          </div>
        </div>

        {/* Interactive Skills Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Interactive Skills (Click to Toggle)</h3>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <Skill
                key={skill}
                skill={skill}
                variant={selectedSkills.includes(skill) ? 'active' : 'inactive'}
                onClick={() => toggleSkill(skill)}
              />
            ))}
          </div>
          
          {selectedSkills.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected skills: {selectedSkills.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
