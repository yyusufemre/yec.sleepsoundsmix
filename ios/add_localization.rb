require 'xcodeproj'

project_path = './ios/SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

languages = ['en', 'tr', 'es', 'pt', 'de', 'fr', 'ja']
known_regions = project.root_object.known_regions

languages.each do |lang|
  known_regions << lang unless known_regions.include?(lang)
end

main_group = project.main_group.find_subpath(File.join('SleepSoundsMix'), true)
target = project.targets.find { |t| t.name == 'SleepSoundsMix' }

# Find or create VariantGroup for InfoPlist.strings
strings_group = main_group.children.find { |c| c.name == 'InfoPlist.strings' && c.class == Xcodeproj::Project::Object::PBXVariantGroup }
if strings_group.nil?
  strings_group = project.new(Xcodeproj::Project::Object::PBXVariantGroup)
  strings_group.name = 'InfoPlist.strings'
  main_group << strings_group
end

languages.each do |lang|
  # Add language to variant group if not exists
  unless strings_group.children.any? { |f| f.name == lang }
    # Xcodeproj expects paths relative to group. If group is SleepSoundsMix, path is #{lang}.lproj/InfoPlist.strings
    file_ref = strings_group.new_file("#{lang}.lproj/InfoPlist.strings")
    file_ref.name = lang
  end
end

# Ensure the variant group is added to the target's resources build phase
if !target.resources_build_phase.files_references.include?(strings_group)
  target.add_resources([strings_group])
end

project.save
puts "Added languages and InfoPlist.strings to Xcode project successfully."
