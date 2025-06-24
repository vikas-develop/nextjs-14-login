import { NextResponse } from 'next/server';

// This is a mock user database - in a real application, you would use a proper database
const MOCK_USER = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123' // In a real app, this would be hashed
};

// Image categories for validation
const imageCategories = {
  animals: ['🐶', '🐱', '🐻', '🦁', '🐸', '🐧'],
  vehicles: ['🚗', '🚲', '✈️', '🚢', '🚁', '🚌'],
  food: ['🍎', '🍕', '🍔', '🍰', '🍌', '🍒'],
  nature: ['🌳', '🌸', '🌞', '🌙', '⭐', '🌈']
};

// Validate image puzzle solution
function validateImagePuzzle(puzzleData: any): boolean {
  if (!puzzleData || !puzzleData.images || !puzzleData.selectedIds || !puzzleData.instruction) {
    return false;
  }

  try {
    const { images, selectedIds, instruction } = puzzleData;
    
    // Extract target category from instruction
    const instructionLower = instruction.toLowerCase();
    let targetCategory = '';
    
    if (instructionLower.includes('animals')) targetCategory = 'animals';
    else if (instructionLower.includes('vehicles')) targetCategory = 'vehicles';
    else if (instructionLower.includes('food')) targetCategory = 'food';
    else if (instructionLower.includes('nature')) targetCategory = 'nature';
    else return false;
    
    // Get expected correct images
    const targetEmojis = imageCategories[targetCategory as keyof typeof imageCategories];
    const correctIds = images
      .filter((img: any) => targetEmojis.includes(img.src))
      .map((img: any) => img.id);
    
    // Validate selection
    const sortedSelected = [...selectedIds].sort();
    const sortedCorrect = [...correctIds].sort();
    
    return sortedSelected.length === sortedCorrect.length &&
           sortedSelected.every((id: number, index: number) => id === sortedCorrect[index]);
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, puzzleData } = body;

    // Validate puzzle first
    if (!puzzleData) {
      return NextResponse.json(
        { error: 'Puzzle verification required' },
        { status: 400 }
      );
    }

    if (!validateImagePuzzle(puzzleData)) {
      return NextResponse.json(
        { error: 'Invalid puzzle solution' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Validate the input
    // 2. Check the database for the user
    // 3. Compare hashed passwords
    // 4. Generate a JWT token
    
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      // In a real app, you would set an HTTP-only cookie with a JWT token
      const response = NextResponse.json({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        name: MOCK_USER.name
      });
      
      response.cookies.set('auth-token', 'mock-jwt-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 