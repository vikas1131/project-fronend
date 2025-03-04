import { ChevronRight, CheckCircle, MapPin, Shield, Server, Wifi, Users, Clipboard, AlertTriangle, Mail, Smartphone, Calendar, Clock } from 'lucide-react';
function Footer() {
    return (
        <>
      <footer className="bg-gray-900 text-gray-300 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Wifi className="w-8 h-8 text-blue-400" />
                <span className="text-xl font-bold text-white">TelecomFieldOps</span>
              </div>
              <p className="text-sm">Bangalore-based telecom operations management since 2023</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">Fault Management</a></li>
                <li><a href="#" className="hover:text-blue-400">Safety Compliance</a></li>
                <li><a href="#" className="hover:text-blue-400">Workforce Tracking</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-400">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>© 2024 TelecomFieldOps. All rights reserved.</p>
          </div>
        </div>
      </footer>
        </>
    )
}

export default Footer;
