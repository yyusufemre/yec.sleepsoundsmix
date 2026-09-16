require 'xcodeproj'

project_path = './SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath(File.join('SleepSoundsMix'), true)

# Remove the bad references
bad_swift = group.files.find { |f| f.path == 'NativeSoundManager.swift' }
bad_m = group.files.find { |f| f.path == 'NativeSoundManager.m' }

if bad_swift
  target.source_build_phase.remove_file_reference(bad_swift)
  bad_swift.remove_from_project
end

if bad_m
  target.source_build_phase.remove_file_reference(bad_m)
  bad_m.remove_from_project
end

# Add the correct references pointing to SleepSoundsMix/NativeSoundManager.*
swift_file = group.new_file('SleepSoundsMix/NativeSoundManager.swift')
m_file = group.new_file('SleepSoundsMix/NativeSoundManager.m')

target.add_file_references([swift_file, m_file])

project.save
puts "Fixed paths successfully."
