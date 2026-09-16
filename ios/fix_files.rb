require 'xcodeproj'

project_path = 'SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath('SleepSoundsMix', false)

# Remove old wrong references
project.files.each do |file|
  if file.path == 'NativeSoundManager.swift' || file.path == 'NativeSoundManager.m' || file.name == 'NativeSoundManager.swift' || file.name == 'NativeSoundManager.m'
    file.remove_from_project
  end
end

# Re-add with explicit correct path
swift_file = group.new_file('SleepSoundsMix/NativeSoundManager.swift')
m_file = group.new_file('SleepSoundsMix/NativeSoundManager.m')

target.add_file_references([swift_file, m_file])

project.save
puts "Fixed references in Xcode project successfully."
