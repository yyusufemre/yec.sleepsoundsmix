require 'xcodeproj'
project_path = './SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath(File.join('SleepSoundsMix', 'Fonts'), true)

fonts_dir = '../node_modules/react-native-vector-icons/Fonts'
Dir.glob("#{fonts_dir}/*.ttf").each do |file|
  file_ref = group.find_file_by_path(file) || group.new_file(file)
  unless target.resources_build_phase.files_references.include?(file_ref)
    target.resources_build_phase.add_file_reference(file_ref)
    puts "Added #{file} to Copy Bundle Resources"
  end
end
project.save
puts "Font linking complete."
