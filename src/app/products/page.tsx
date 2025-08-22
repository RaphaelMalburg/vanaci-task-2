import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    description: "Pain relief and fever reducer",
    price: "$8.99",
    category: "Pain Relief",
    inStock: true
  },
  {
    id: 2,
    name: "Ibuprofen 400mg",
    description: "Anti-inflammatory pain reliever",
    price: "$12.50",
    category: "Pain Relief",
    inStock: true
  },
  {
    id: 3,
    name: "Vitamin D3 1000 IU",
    description: "Essential vitamin for bone health",
    price: "$15.99",
    category: "Vitamins",
    inStock: true
  },
  {
    id: 4,
    name: "Omega-3 Fish Oil",
    description: "Heart and brain health supplement",
    price: "$24.99",
    category: "Supplements",
    inStock: false
  },
  {
    id: 5,
    name: "Cough Syrup",
    description: "Relief for dry and productive coughs",
    price: "$9.75",
    category: "Cold & Flu",
    inStock: true
  },
  {
    id: 6,
    name: "Multivitamin Complex",
    description: "Complete daily vitamin supplement",
    price: "$18.99",
    category: "Vitamins",
    inStock: true
  },
  {
    id: 7,
    name: "Antacid Tablets",
    description: "Fast relief from heartburn and indigestion",
    price: "$6.50",
    category: "Digestive Health",
    inStock: true
  },
  {
    id: 8,
    name: "Allergy Relief 24hr",
    description: "Non-drowsy antihistamine",
    price: "$14.25",
    category: "Allergy",
    inStock: true
  },
  {
    id: 9,
    name: "Probiotic Capsules",
    description: "Digestive and immune system support",
    price: "$29.99",
    category: "Digestive Health",
    inStock: false
  }
];

const categories = ["All", "Pain Relief", "Vitamins", "Supplements", "Cold & Flu", "Digestive Health", "Allergy"];

export default function Products() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Our Products
          </h1>
          <p className="text-xl text-gray-600">
            Quality healthcare products for your well-being
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm text-blue-600 font-medium">
                      {product.category}
                    </CardDescription>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {product.price}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    product.inStock ? "text-green-600" : "text-red-600"
                  }`}>
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock}
                    className="ml-2"
                  >
                    {product.inStock ? "Add to Cart" : "Notify Me"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Important Notice
          </h3>
          <p className="text-yellow-700">
            This is a demo pharmacy website. All products and prices shown are for 
            demonstration purposes only. Please consult with a healthcare professional 
            before taking any medications. For real prescriptions and medical advice, 
            visit a licensed pharmacy.
          </p>
        </div>
      </div>
    </div>
  );
}