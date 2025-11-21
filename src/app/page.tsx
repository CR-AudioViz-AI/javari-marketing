'use client'
import {Mail,Facebook,Instagram,Globe,BarChart,Send,Eye,Users} from 'lucide-react'
const campaigns=[
  {id:'1',name:'New Listing - Ocean Drive',type:'Email',status:'sent',sent:245,opened:178,clicked:42,date:'2024-11-18'},
  {id:'2',name:'Open House This Weekend',type:'Social',status:'scheduled',reach:1200,engagement:85,date:'2024-11-21'},
  {id:'3',name:'Buyer Guide 2024',type:'Landing Page',status:'active',visits:456,conversions:23,date:'2024-11-15'},
]
export default function Marketing(){
  return(
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b"><div className="max-w-7xl mx-auto px-4 py-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Mail className="w-8 h-8 text-blue-600"/><div><h1 className="text-2xl font-bold">Marketing Tools</h1><p className="text-sm text-gray-500">Campaigns and automation</p></div></div><button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><Send className="w-5 h-5"/>New Campaign</button></div></div></header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Active Campaigns</p><p className="text-3xl font-bold">{campaigns.length}</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Total Reach</p><p className="text-3xl font-bold text-blue-600">1.9K</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Avg Open Rate</p><p className="text-3xl font-bold text-green-600">72%</p></div>
          <div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Conversions</p><p className="text-3xl font-bold text-orange-600">65</p></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white"><Mail className="w-12 h-12 mb-4"/><h3 className="text-xl font-semibold mb-2">Email Campaigns</h3><p className="text-white/80">Send targeted emails to your leads</p><button className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">Create Campaign</button></div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white"><Instagram className="w-12 h-12 mb-4"/><h3 className="text-xl font-semibold mb-2">Social Media</h3><p className="text-white/80">Schedule posts across platforms</p><button className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">Schedule Post</button></div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white"><Globe className="w-12 h-12 mb-4"/><h3 className="text-xl font-semibold mb-2">Landing Pages</h3><p className="text-white/80">Build conversion-focused pages</p><button className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">Create Page</button></div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b"><h2 className="text-xl font-semibold">Recent Campaigns</h2></div>
          <div className="divide-y">
            {campaigns.map(c=>(
              <div key={c.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-semibold text-lg">{c.name}</h3><p className="text-sm text-gray-600">{c.type} • {c.date}</p></div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.status==='sent'?'bg-green-100 text-green-700':c.status==='scheduled'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-700'}`}>{c.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {c.sent&&<div><p className="text-sm text-gray-600">Sent</p><p className="text-xl font-bold">{c.sent}</p></div>}
                  {c.opened&&<div><p className="text-sm text-gray-600">Opened</p><p className="text-xl font-bold text-blue-600">{c.opened}</p></div>}
                  {c.clicked&&<div><p className="text-sm text-gray-600">Clicked</p><p className="text-xl font-bold text-green-600">{c.clicked}</p></div>}
                  {c.reach&&<div><p className="text-sm text-gray-600">Reach</p><p className="text-xl font-bold">{c.reach}</p></div>}
                  {c.engagement&&<div><p className="text-sm text-gray-600">Engagement</p><p className="text-xl font-bold text-blue-600">{c.engagement}</p></div>}
                  {c.visits&&<div><p className="text-sm text-gray-600">Visits</p><p className="text-xl font-bold">{c.visits}</p></div>}
                  {c.conversions&&<div><p className="text-sm text-gray-600">Conversions</p><p className="text-xl font-bold text-green-600">{c.conversions}</p></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
