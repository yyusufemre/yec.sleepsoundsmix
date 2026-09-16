require 'xcodeproj'

project_path = './SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath(File.join('SleepSoundsMix'), true)

swift_file = group.find_file_by_path('NativeSoundManager.swift') || group.new_file('NativeSoundManager.swift')
m_file = group.find_file_by_path('NativeSoundManager.m') || group.new_file('NativeSoundManager.m')

if !target.source_build_phase.files_references.include?(swift_file)
  target.add_file_references([swift_file])
end

if !target.source_build_phase.files_references.include?(m_file)
  target.add_file_references([m_file])
end

project.save
puts "Added files to Xcode project successfully."
