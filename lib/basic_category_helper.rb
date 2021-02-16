class BasicCategoryHelper
  # category names by themselves are not unique and might
  # later be overriden by internationalization code
  # => basic_name is necessary to uniquely address them
  #    in the frontend.
  def self.create_category(name, basic_name, position=nil)
    category = self.create_category_raw(name, position)
    category.custom_fields['basic_name'] = basic_name
    category.save_custom_fields(true)
  end
  def self.create_category_raw(name, position=nil)
      return Category.create({"position"=>position,"user_id"=> 1 ,"name"=>name, "color"=>"0088CC", "text_color"=>"FFFFFF", "permissions"=>{"everyone"=>"1"},"required_tag_group_name"=>"", "topic_featured_link_allowed"=>"true", "search_priority"=>"0"}) if position
      return Category.create({"user_id"=> 1 ,"name"=>name, "color"=>"0088CC", "text_color"=>"FFFFFF", "permissions"=>{"everyone"=>"1"},"required_tag_group_name"=>"", "topic_featured_link_allowed"=>"true", "search_priority"=>"0"})
  end
end
