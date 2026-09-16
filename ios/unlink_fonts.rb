require 'xcodeproj'
project_path = './SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |t| t.name == 'SleepSoundsMix' }
group = project.main_group.find_subpath(File.join('SleepSoundsMix', 'Fonts'), false)

if group
  fonts_dir = '../node_modules/react-native-vector-icons/Fonts'
  Dir.glob("#{fonts_dir}/*.ttf").each do |file|
    file_ref = group.find_file_by_path(file)
    if file_ref
      target.resources_build_phase.remove_file_reference(file_ref)
      file_ref.remove_from_project
      puts "Removed #{file} from project"
    end
  end
end

project.save
puts "Font unlinking complete."
