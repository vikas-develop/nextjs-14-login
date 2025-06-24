'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ImagePuzzleData {
  images: Array<{
    id: number;
    src: string;
    category: string;
    isCorrect: boolean;
  }>;
  instruction: string;
  correctIds: number[];
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [puzzle, setPuzzle] = useState<ImagePuzzleData | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  // Predefined image categories with emojis and descriptions
  const imageCategories = {
    animals: [
      { emoji: '🐶', desc: 'Dog' },
      { emoji: '🐱', desc: 'Cat' },
      { emoji: '🐻', desc: 'Bear' },
      { emoji: '🦁', desc: 'Lion' },
      { emoji: '🐸', desc: 'Frog' },
      { emoji: '🐧', desc: 'Penguin' },
    ],
    vehicles: [
      { emoji: '🚗', desc: 'Car' },
      { emoji: '🚲', desc: 'Bicycle' },
      { emoji: '✈️', desc: 'Airplane' },
      { emoji: '🚢', desc: 'Ship' },
      { emoji: '🚁', desc: 'Helicopter' },
      { emoji: '🚌', desc: 'Bus' },
    ],
    food: [
      { emoji: '🍎', desc: 'Apple' },
      { emoji: '🍕', desc: 'Pizza' },
      { emoji: '🍔', desc: 'Burger' },
      { emoji: '🍰', desc: 'Cake' },
      { emoji: '🍌', desc: 'Banana' },
      { emoji: '🍒', desc: 'Cherry' },
    ],
    nature: [
      { emoji: '🌳', desc: 'Tree' },
      { emoji: '🌸', desc: 'Flower' },
      { emoji: '🌞', desc: 'Sun' },
      { emoji: '🌙', desc: 'Moon' },
      { emoji: '⭐', desc: 'Star' },
      { emoji: '🌈', desc: 'Rainbow' },
    ]
  };

  // Generate a new image puzzle
  const generateImagePuzzle = (): ImagePuzzleData => {
    const categories = Object.keys(imageCategories);
    const targetCategory = categories[Math.floor(Math.random() * categories.length)];
    const targetCategoryName = targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1);
    
    // Get items from target category
    const targetItems = imageCategories[targetCategory as keyof typeof imageCategories];
    const numCorrect = Math.floor(Math.random() * 3) + 2; // 2-4 correct images
    const correctItems = targetItems.slice(0, numCorrect);
    
    // Get items from other categories as distractors
    const otherCategories = categories.filter(cat => cat !== targetCategory);
    const distractorItems: Array<{emoji: string, desc: string}> = [];
    
    otherCategories.forEach(category => {
      const items = imageCategories[category as keyof typeof imageCategories];
      const numFromCategory = Math.floor(Math.random() * 2) + 1; // 1-2 items per category
      distractorItems.push(...items.slice(0, numFromCategory));
    });
    
    // Combine and shuffle
    const allItems = [
      ...correctItems.map(item => ({ ...item, isCorrect: true, category: targetCategory })),
      ...distractorItems.slice(0, 9 - correctItems.length).map(item => ({ ...item, isCorrect: false, category: 'distractor' }))
    ];
    
    // Shuffle array
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }
    
    const images = allItems.map((item, index) => ({
      id: index,
      src: item.emoji,
      category: item.category,
      isCorrect: item.isCorrect
    }));
    
    const correctIds = images.filter(img => img.isCorrect).map(img => img.id);
    
    return {
      images,
      instruction: `Select all images that show ${targetCategoryName.toLowerCase()}`,
      correctIds
    };
  };

  // Initialize puzzle on component mount
  useEffect(() => {
    setPuzzle(generateImagePuzzle());
  }, []);

  // Refresh puzzle
  const refreshPuzzle = () => {
    setPuzzle(generateImagePuzzle());
    setSelectedImages([]);
  };

  // Handle image selection
  const toggleImageSelection = (imageId: number) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Validate puzzle solution
  const validatePuzzle = (): boolean => {
    if (!puzzle) return false;
    
    const sortedSelected = [...selectedImages].sort();
    const sortedCorrect = [...puzzle.correctIds].sort();
    
    return sortedSelected.length === sortedCorrect.length &&
           sortedSelected.every((id, index) => id === sortedCorrect[index]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate puzzle first
    if (!validatePuzzle()) {
      setError('Please solve the image puzzle correctly');
      refreshPuzzle();
      return;
    }
    
    try {
      const puzzleData = {
        images: puzzle?.images || [],
        selectedIds: selectedImages,
        instruction: puzzle?.instruction || ''
      };
      
      await login(email, password, puzzleData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
      refreshPuzzle(); // Refresh puzzle on login failure
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Image Puzzle Verification */}
            <div className="bg-gray-50 p-4 rounded-b-md border border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Security Verification
                </label>
                <button
                  type="button"
                  onClick={refreshPuzzle}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  title="Refresh puzzle"
                >
                  🔄
                </button>
              </div>
              
              {puzzle && (
                <div>
                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    {puzzle.instruction}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {puzzle.images.map((image) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => toggleImageSelection(image.id)}
                        className={`
                          relative p-4 text-3xl border-2 rounded-lg transition-all duration-200 hover:scale-105
                          ${selectedImages.includes(image.id)
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                          }
                        `}
                      >
                        {image.src}
                        {selectedImages.includes(image.id) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Click on images to select them. Selected images will be highlighted.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 