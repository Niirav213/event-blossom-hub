
import { Ticket, Music, Utensils, Award, Palette, Users, Newspaper, Bike } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Concerts",
    icon: <Music className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Live music performances",
    link: "/events?category=concerts"
  },
  {
    name: "Food & Drink",
    icon: <Utensils className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Culinary experiences",
    link: "/events?category=food-and-drink"
  },
  {
    name: "Sports",
    icon: <Bike className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Athletic events and competitions",
    link: "/events?category=sports"
  },
  {
    name: "Exhibitions",
    icon: <Palette className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Art displays and showcases",
    link: "/events?category=exhibitions"
  },
  {
    name: "Festivals",
    icon: <Award className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Celebrations and cultural events",
    link: "/events?category=festivals"
  },
  {
    name: "Networking",
    icon: <Users className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Professional meetups",
    link: "/events?category=networking"
  },
  {
    name: "Workshops",
    icon: <Ticket className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Educational sessions",
    link: "/events?category=workshops"
  },
  {
    name: "Conferences",
    icon: <Newspaper className="h-6 w-6 mb-3 text-eventPurple" />,
    description: "Industry gatherings",
    link: "/events?category=conferences"
  },
];

const CategorySection = () => {
  return (
    <section className="py-12 md:py-16 bg-eventGray">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-center">Explore Events By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link to={category.link} key={index} className="bg-white rounded-lg p-4 md:p-6 text-center hover:shadow-md transition-shadow group">
              <div className="flex justify-center">{category.icon}</div>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-eventPurple transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
