import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to My Pharmacy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your trusted healthcare partner providing quality medicines and professional care
            </p>
            <Link href="/products">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                View Our Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose My Pharmacy?
            </h2>
            <p className="text-lg text-gray-600">
              We're committed to providing exceptional healthcare services to our community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Quality Products</CardTitle>
                <CardDescription>
                  We stock only the highest quality medicines from trusted manufacturers
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Expert Advice</CardTitle>
                <CardDescription>
                  Our qualified pharmacists are always ready to provide professional guidance
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Convenient Service</CardTitle>
                <CardDescription>
                  Fast, reliable service with convenient hours to serve you better
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
