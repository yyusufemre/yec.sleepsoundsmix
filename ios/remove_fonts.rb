require 'xcodeproj'

project_path = 'SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find and remove the Resources group that react-native-asset created
group = project.main_group.find_subpath('Resources', false)
if group
  group.remove_from_project
end

# Remove any .ttf files from the project reference list
project.files.each do |file|
  if file.path && file.path.end_with?('.ttf')
    file.remove_from_project
  end
end

# Remove from Copy Bundle Resources build phase
project.targets.each do |target|
  target.resources_build_phase.files.each do |build_file|
    if build_file.file_ref && build_file.file_ref.path && build_file.file_ref.path.end_with?('.ttf')
      target.resources_build_phase.remove_build_file(build_file)
    end
  end
end

project.save
puts "Removed .ttf files and Resources group from Xcode project."
