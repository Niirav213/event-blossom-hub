
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Calendar, Users, School } from "lucide-react";

const AboutPage = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    // Update document title
    document.title = "About Us | CollegeEventHub";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-eventPurple to-eventPurple-dark text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our College</h1>
            <p className="text-xl mb-6">Learn about Manipal Institute of Technology Bengaluru Campus</p>
          </div>
        </section>

        {/* College Information */}
        <section className="py-16 bg-accent">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-eventPurple mb-6">Manipal Institute of Technology</h2>
                <h3 className="text-2xl font-semibold mb-4">Bengaluru Campus</h3>
                <p className="text-gray-700 mb-6">
                  Manipal Institute of Technology, Bengaluru Campus is a premier institution dedicated 
                  to excellence in technical education. Established as an extension of the renowned 
                  Manipal Academy of Higher Education, our campus combines innovative teaching methodologies 
                  with state-of-the-art infrastructure to nurture the next generation of engineers and technologists.
                </p>
                <p className="text-gray-700 mb-6">
                  Our mission is to provide a holistic educational experience that focuses not just on 
                  academic excellence but also on personal growth, leadership skills, and social responsibility.
                </p>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <MapPin className="text-eventPurple mr-3 h-5 w-5" />
                    <span className="text-gray-700">123 University Avenue, Bengaluru, Karnataka 560001</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="text-eventPurple mr-3 h-5 w-5" />
                    <span className="text-gray-700">+91 80 1234 5678</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="text-eventPurple mr-3 h-5 w-5" />
                    <span className="text-gray-700">admissions@manipal-bangalore.edu.in</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1986&q=80" 
                  alt="Manipal Institute of Technology Campus" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Campus Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-eventPurple mb-12">Campus Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <School className="h-12 w-12 text-eventPurple mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Academic Excellence</h3>
                    <p className="text-gray-700">
                      State-of-the-art laboratories, modern classrooms, and a comprehensive library with digital resources.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Users className="h-12 w-12 text-eventPurple mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Student Life</h3>
                    <p className="text-gray-700">
                      Vibrant student community with numerous clubs, organizations, and cultural events throughout the year.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Calendar className="h-12 w-12 text-eventPurple mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Events & Workshops</h3>
                    <p className="text-gray-700">
                      Regular technical workshops, hackathons, cultural festivals, and industry-connected events.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Mission & Vision */}
        <section className="py-16 bg-accent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-eventPurple mb-8">Our Mission & Vision</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Mission</h3>
                <p className="text-gray-700">
                  To develop competent technical professionals with a sense of responsibility, 
                  ethics, and social awareness through quality education and research.
                </p>
              </div>
              
              <Separator className="my-8" />
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Vision</h3>
                <p className="text-gray-700">
                  To be a leading institution for technical education that cultivates innovation, 
                  leadership, and excellence, preparing students to meet global challenges.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
