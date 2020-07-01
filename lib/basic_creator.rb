class BasicCreator
  class_attribute :template
  def initialize(jraw, opts)
    filename = File.basename(self.method(:create).source_location[0] , ".rb")
    dirname = File.dirname(self.method(:create).source_location[0])
    self.template ||= File.read(dirname + "/"+filename+ ".html.erb")
    @jraw = jraw
    @opts = opts
  end
end
