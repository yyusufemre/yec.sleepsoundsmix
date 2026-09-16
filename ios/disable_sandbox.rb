require 'xcodeproj'

project_path = 'SleepSoundsMix.xcodeproj'
project = Xcodeproj::Project.open(project_path)

project.build_configurations.each do |config|
  config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
end

project.targets.each do |target|
  target.build_configurations.each do |config|
    config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
  end
end

project.save
puts "Disabled User Script Sandboxing successfully."
