require 'xcodeproj'

project_path = './SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath(File.join('SleepSoundsMix'), true)

file_path = 'GoogleService-Info.plist'

# Create a file reference if it doesn't exist in the group
file_ref = group.files.find { |f| f.path == file_path }
if file_ref.nil?
  file_ref = group.new_file(file_path)
end

# Add the file to the Resources build phase if it's not already there
resources_build_phase = target.resources_build_phase
unless resources_build_phase.files_references.include?(file_ref)
  resources_build_phase.add_file_reference(file_ref)
  puts "Added GoogleService-Info.plist to Resources Build Phase."
else
  puts "GoogleService-Info.plist is already in Resources Build Phase."
end

project.save
puts "Xcode project saved."
