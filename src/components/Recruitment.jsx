import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Building2, Clock, Bookmark, Share2, X, Filter, ChevronDown, Star, Users, Calendar, ArrowRight, Send, Plus } from 'lucide-react';
import { recruitmentApi } from '../services/api';

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [selectedSalary, setSelectedSalary] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    experience: '',
    description: '',
    skills: '',
    requirements: ''
  });
  const [application, setApplication] = useState({
    email: '',
    phone: '',
    resume: '',
    coverLetter: '',
    expectedSalary: '',
    noticePeriod: ''
  });
  const [resumePreview, setResumePreview] = useState('');

  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const indianLocations = [
    'All', 'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 
    'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 
    'Coimbatore', 'Nagpur', 'Surat', 'Vizag', 'Mysore', 'Trivandrum', 'Remote'
  ];

  const jobTypes = ['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship', 'Walk-in'];
  const experienceLevels = ['All', 'Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];
  const salaryRanges = ['All', '0-3 LPA', '3-6 LPA', '6-10 LPA', '10-15 LPA', '15-25 LPA', '25+ LPA'];

  useEffect(() => {
    loadJobs();
    loadApplications();
    loadSavedJobs();
  }, []);

  const loadJobs = async () => {
    try {
      console.log('Loading jobs from API...');
      const response = await recruitmentApi.getJobs();
      console.log('Jobs response:', response.data);
      const activeJobs = response.data.filter(j => j.status === 'Active');
      console.log('Active jobs:', activeJobs);
      setJobs(activeJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const loadApplications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await recruitmentApi.getApplicantApplications(userId);
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadSavedJobs = () => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setSavedJobs(saved);
  };

  const handleSaveJob = (jobId) => {
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (saved.includes(jobId)) {
      const newSaved = saved.filter(id => id !== jobId);
      localStorage.setItem('savedJobs', JSON.stringify(newSaved));
      setSavedJobs(newSaved);
    } else {
      saved.push(jobId);
      localStorage.setItem('savedJobs', JSON.stringify(saved));
      setSavedJobs(saved);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyForm(true);
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobDetail(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      const resumeFile = e.target.resumeFile?.files?.[0];
      let resumeData = application.resume;
      
      if (resumeFile) {
        resumeData = await fileToDataUrl(resumeFile);
      }
      
      await recruitmentApi.createApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        applicantId: userId,
        applicantName: userName || 'Anonymous',
        ...application,
        resume: resumeData
      });
      loadApplications();
      setApplication({
        email: '',
        phone: '',
        resume: '',
        coverLetter: '',
        expectedSalary: '',
        noticePeriod: ''
      });
      setResumePreview('');
      setShowApplyForm(false);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  const validateJobForm = () => {
    const errors = {};
    
    if (!newJob.title.trim()) {
      errors.title = 'Job title is required';
    } else if (newJob.title.length < 5) {
      errors.title = 'Job title must be at least 5 characters';
    } else if (newJob.title.length > 100) {
      errors.title = 'Job title must not exceed 100 characters';
    }
    
    if (!newJob.company.trim()) {
      errors.company = 'Company name is required';
    } else if (newJob.company.length < 2) {
      errors.company = 'Company name must be at least 2 characters';
    } else if (newJob.company.length > 100) {
      errors.company = 'Company name must not exceed 100 characters';
    }
    
    if (!newJob.location) {
      errors.location = 'Location is required';
    }
    
    if (!newJob.salary) {
      errors.salary = 'Salary range is required';
    }
    
    if (!newJob.type) {
      errors.type = 'Job type is required';
    }
    
    if (!newJob.description.trim()) {
      errors.description = 'Job description is required';
    } else if (newJob.description.length < 50) {
      errors.description = 'Description must be at least 50 characters';
    } else if (newJob.description.length > 5000) {
      errors.description = 'Description must not exceed 5000 characters';
    }
    
    if (!newJob.skills.trim()) {
      errors.skills = 'Skills are required';
    } else {
      const skillList = newJob.skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillList.length === 0) {
        errors.skills = 'At least one skill is required';
      }
    }
    
    if (newJob.requirements && newJob.requirements.length > 2000) {
      errors.requirements = 'Requirements must not exceed 2000 characters';
    }
    
    return errors;
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    
    const errors = validateJobForm();
    if (Object.keys(errors).length > 0) {
      alert('Please fix the following errors:\n' + Object.values(errors).join('\n'));
      return;
    }
    
    try {
      await recruitmentApi.createJob({
        ...newJob,
        skills: newJob.skills.split(',').map(s => s.trim()),
        status: 'Active',
        createdAt: new Date().toISOString()
      });
      loadJobs();
      setNewJob({
        title: '',
        company: '',
        location: '',
        salary: '',
        type: 'Full-time',
        experience: '',
        description: '',
        skills: '',
        requirements: ''
      });
      setShowPostJob(false);
      alert('Job posted successfully!');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Error posting job. Please try again.');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchMatch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const locationMatch = selectedLocation === 'All' || job.location === selectedLocation;
    const typeMatch = selectedJobType === 'All' || job.type === selectedJobType;
    return searchMatch && locationMatch && typeMatch;
  });

  const getSalaryColor = (salary) => {
    if (salary.includes('25+') || salary.includes('20')) return 'text-green-600';
    if (salary.includes('15') || salary.includes('10')) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffDays = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job in India</h1>
          <p className="text-xl text-blue-100 mb-8">Discover thousands of opportunities from top companies</p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white"
              >
                {indianLocations.map(loc => <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>)}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 text-gray-700 transition-colors"
              >
                <Filter size={20} />
                Filters
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{jobs.length}</p>
              <p className="text-blue-100 text-sm">Active Jobs</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{indianLocations.length - 1}</p>
              <p className="text-blue-100 text-sm">Cities</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{jobTypes.length - 1}</p>
              <p className="text-blue-100 text-sm">Job Types</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{applications.length}</p>
              <p className="text-blue-100 text-sm">Your Applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-72 bg-white rounded-2xl shadow-lg p-6 h-fit sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Job Type</label>
                  <div className="space-y-2">
                    {jobTypes.map(type => (
                      <label key={type} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="jobType"
                          value={type}
                          checked={selectedJobType === type}
                          onChange={(e) => setSelectedJobType(e.target.value)}
                          className="mr-2 accent-blue-600"
                        />
                        <span className="text-sm text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Experience</label>
                  <div className="space-y-2">
                    {experienceLevels.map(level => (
                      <label key={level} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="experience"
                          value={level}
                          checked={selectedExperience === level}
                          onChange={(e) => setSelectedExperience(e.target.value)}
                          className="mr-2 accent-blue-600"
                        />
                        <span className="text-sm text-gray-600">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Salary Range</label>
                  <div className="space-y-2">
                    {salaryRanges.map(range => (
                      <label key={range} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="salary"
                          value={range}
                          checked={selectedSalary === range}
                          onChange={(e) => setSelectedSalary(e.target.value)}
                          className="mr-2 accent-blue-600"
                        />
                        <span className="text-sm text-gray-600">{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJobType('All');
                    setSelectedExperience('All');
                    setSelectedSalary('All');
                    setSelectedLocation('All');
                  }}
                  className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Jobs List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredJobs.length} Jobs Found
              </h2>
              <button
                onClick={() => setShowPostJob(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center shadow-lg hover:shadow-xl"
              >
                <Plus size={20} className="mr-2" />
                Post a Job
              </button>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 cursor-pointer group"
                  onClick={() => handleViewJob(job)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Company Logo Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {job.company.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Building2 size={16} />
                            {job.company}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                          className={`p-2 rounded-lg transition-colors ${savedJobs.includes(job.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          <Bookmark size={20} fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          <Briefcase size={14} />
                          {job.type}
                        </span>
                        <span className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${getSalaryColor(job.salary)}`}>
                          <DollarSign size={14} />
                          {job.salary}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                          <Clock size={14} />
                          {getTimeAgo(job.createdAt)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-xs text-gray-500 px-2 py-1">+{job.skills.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(job);
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      Apply Now
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewJob(job);
                      }}
                      className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                      View Details
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-16">
                <Briefcase size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No jobs found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>

        {/* Your Applications Section */}
        {applications.length > 0 && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Applications</h2>
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{app.jobTitle}</p>
                      <p className="text-sm text-gray-500">Applied: {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                      app.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {showJobDetail && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                    {selectedJob.company.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedJob.title}</h2>
                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                      <Building2 size={18} />
                      {selectedJob.company}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowJobDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <MapPin size={18} />
                  {selectedJob.location}
                </span>
                <span className="flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                  <Briefcase size={18} />
                  {selectedJob.type}
                </span>
                <span className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-full ${getSalaryColor(selectedJob.salary)}`}>
                  <DollarSign size={18} />
                  {selectedJob.salary}
                </span>
                <span className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                  <Clock size={18} />
                  Posted {getTimeAgo(selectedJob.createdAt)}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Job Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowJobDetail(false);
                    handleApply(selectedJob);
                  }}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Apply Now
                </button>
                <button
                  onClick={() => handleSaveJob(selectedJob.id)}
                  className={`px-6 py-4 rounded-xl font-semibold flex items-center gap-2 transition-colors ${savedJobs.includes(selectedJob.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <Bookmark size={20} fill={savedJobs.includes(selectedJob.id) ? 'currentColor' : 'none'} />
                  {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {showApplyForm && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Apply for {selectedJob.title}</h2>
                <button onClick={() => setShowApplyForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={application.email}
                      onChange={(e) => setApplication({ ...application, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={application.phone}
                      onChange={(e) => setApplication({ ...application, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Salary</label>
                    <input
                      type="text"
                      value={application.expectedSalary}
                      onChange={(e) => setApplication({ ...application, expectedSalary: e.target.value })}
                      placeholder="e.g., 8-12 LPA"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notice Period</label>
                    <select
                      value={application.noticePeriod}
                      onChange={(e) => setApplication({ ...application, noticePeriod: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select</option>
                      <option value="Immediate">Immediate</option>
                      <option value="15 days">15 days</option>
                      <option value="30 days">30 days</option>
                      <option value="60 days">60 days</option>
                      <option value="90 days">90 days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Resume (URL or File Upload) *</label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={application.resume}
                      onChange={(e) => setApplication({ ...application, resume: e.target.value })}
                      placeholder="Link to your resume (Google Drive, LinkedIn, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="text-sm text-gray-500">- OR -</div>
                    <input
                      name="resumeFile"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const preview = await fileToDataUrl(file);
                          setResumePreview(preview);
                          setApplication({ ...application, resume: preview });
                        }
                      }}
                    />
                    {resumePreview && (
                      <div className="text-sm text-green-600">
                        ✓ File selected: {application.resume?.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Letter</label>
                  <textarea
                    value={application.coverLetter}
                    onChange={(e) => setApplication({ ...application, coverLetter: e.target.value })}
                    placeholder="Tell us why you're a great fit for this role..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Submit Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Post New Job</h2>
                <button onClick={() => setShowPostJob(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={newJob.company}
                      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                    <select
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Location</option>
                      {indianLocations.filter(loc => loc !== 'All').map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type *</label>
                    <select
                      value={newJob.type}
                      onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {jobTypes.filter(type => type !== 'All').map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range *</label>
                    <select
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Range</option>
                      {salaryRanges.filter(range => range !== 'All').map(range => (
                        <option key={range} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Experience Required</label>
                    <select
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Experience</option>
                      {experienceLevels.filter(level => level !== 'All').map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills (comma separated) *</label>
                  <input
                    type="text"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                    placeholder="e.g., React, Node.js, MongoDB"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements</label>
                  <textarea
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Additional requirements for this role..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Post Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostJob(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
