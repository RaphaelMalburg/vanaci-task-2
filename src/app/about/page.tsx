import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About My Pharmacy
          </h1>
          <p className="text-xl text-gray-600">
            Serving our community with dedication and care since 1995
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                My Pharmacy was founded in 1995 with a simple mission: to provide our community 
                with access to quality healthcare products and professional pharmaceutical services. 
                What started as a small neighborhood pharmacy has grown into a trusted healthcare 
                partner for thousands of families in our area.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                We are committed to improving the health and well-being of our community by 
                providing personalized pharmaceutical care, quality products, and expert advice. 
                Our team of licensed pharmacists and healthcare professionals work together to 
                ensure every customer receives the attention and care they deserve.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prescription Services</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Prescription filling and refills</li>
                    <li>• Medication therapy management</li>
                    <li>• Drug interaction screening</li>
                    <li>• Insurance claim processing</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Health & Wellness</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li>• Over-the-counter medications</li>
                    <li>• Vitamins and supplements</li>
                    <li>• Health screenings</li>
                    <li>• Vaccination services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Our experienced team includes licensed pharmacists, pharmacy technicians, and 
                customer service specialists who are passionate about healthcare. We believe in 
                building lasting relationships with our customers and providing personalized 
                care that goes beyond just filling prescriptions.
              </p>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Visit Us Today
            </h3>
            <div className="text-gray-700">
              <p className="mb-2">123 Healthcare Avenue, Medical District</p>
              <p className="mb-2">Phone: (555) 123-MEDS</p>
              <p>Hours: Monday - Saturday 8:00 AM - 9:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}