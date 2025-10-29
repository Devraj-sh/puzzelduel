export interface Puzzle {
  id: number;
  type: "logic" | "riddle" | "math" | "pattern";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  aiApproach: string;
  humanApproach: string;
}

export const puzzles: Puzzle[] = [
  {
    id: 1,
    type: "pattern",
    question: "Find the next number: 2, 4, 8, 16, ?",
    options: ["18", "24", "32", "64"],
    answer: "32",
    explanation: "Each term doubles — exponential growth pattern (2^n).",
    aiApproach: "Detects exponential pattern by calculating ratios between consecutive terms (4/2=2, 8/4=2). Applies formula 2^n where n=5.",
    humanApproach: "Recognizes doubling pattern through visual observation. 'Each number is twice the previous one.'"
  },
  {
    id: 2,
    type: "riddle",
    question: "What has hands but cannot clap?",
    options: ["Clock", "Monkey", "Robot", "Fan"],
    answer: "Clock",
    explanation: "Wordplay riddle using multiple meanings of 'hands'.",
    aiApproach: "Searches vocabulary database for objects with 'hands' as components. Cross-references with 'cannot clap' constraint.",
    humanApproach: "Uses metaphorical thinking and real-world experience. Visualizes objects with hand-like features."
  },
  {
    id: 3,
    type: "math",
    question: "If 5 pencils cost $10, how much do 15 pencils cost?",
    options: ["$15", "$20", "$25", "$30"],
    answer: "$30",
    explanation: "Linear proportion: 15 pencils = 3 × 5 pencils = 3 × $10.",
    aiApproach: "Calculates unit price ($10/5=$2), then multiplies by quantity (15×$2=$30). Uses algebraic formula.",
    humanApproach: "Recognizes 15 is 3 times 5, so cost is 3 times $10. Mental arithmetic and proportional reasoning."
  },
  {
    id: 4,
    type: "logic",
    question: "All cats are animals. Fluffy is a cat. Therefore...",
    options: ["Fluffy can fly", "Fluffy is an animal", "Fluffy is small", "Fluffy is wild"],
    answer: "Fluffy is an animal",
    explanation: "Syllogistic reasoning: If A⊆B and x∈A, then x∈B.",
    aiApproach: "Applies formal logic rules. Parses premise structure and validates conclusion using set theory.",
    humanApproach: "Natural language understanding combined with common sense. 'If all cats are animals and Fluffy is a cat, then obviously Fluffy is an animal.'"
  },
  {
    id: 5,
    type: "pattern",
    question: "What comes next: 🔴🔵🔴🔵🔴?",
    options: ["🔴", "🔵", "🟢", "🟡"],
    answer: "🔵",
    explanation: "Alternating pattern between red and blue.",
    aiApproach: "Pattern matching algorithm detects alternating sequence. Predicts next element based on frequency analysis.",
    humanApproach: "Visual pattern recognition. 'Red, blue, red, blue, red... next should be blue.'"
  },
  {
    id: 6,
    type: "riddle",
    question: "What gets wetter the more it dries?",
    options: ["Sponge", "Towel", "Rain", "Ocean"],
    answer: "Towel",
    explanation: "Paradoxical riddle about towels absorbing water while drying things.",
    aiApproach: "Semantic analysis of 'wet' and 'dry' in different contexts. Cross-reference with object properties.",
    humanApproach: "Lateral thinking about everyday objects. Considers practical experience with drying things."
  },
  {
    id: 7,
    type: "math",
    question: "A train travels 60 km in 1 hour. How far in 30 minutes?",
    options: ["20 km", "30 km", "40 km", "60 km"],
    answer: "30 km",
    explanation: "Speed = 60 km/hr. Half time = half distance.",
    aiApproach: "Calculates velocity (60 km/hr), converts time to hours (0.5), applies distance formula d=vt.",
    humanApproach: "Simple proportion: 30 minutes is half an hour, so half the distance."
  },
  {
    id: 8,
    type: "logic",
    question: "If A=1, B=2, C=3, what is CAB?",
    options: ["4", "6", "123", "321"],
    answer: "6",
    explanation: "C(3) + A(1) + B(2) = 6",
    aiApproach: "Character-to-number mapping function. Parses string 'CAB', looks up values, sums results.",
    humanApproach: "Substitutes letters with numbers mentally: 'C is 3, A is 1, B is 2, so 3+1+2=6.'"
  },
  {
    id: 9,
    type: "pattern",
    question: "Continue the sequence: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "13", "15", "21"],
    answer: "13",
    explanation: "Fibonacci sequence: each number is sum of previous two.",
    aiApproach: "Pattern detection identifies Fibonacci rule: F(n) = F(n-1) + F(n-2). Computes next term.",
    humanApproach: "Notices each number equals the sum of previous two: 5+8=13."
  },
  {
    id: 10,
    type: "riddle",
    question: "The more you take away, the bigger it becomes. What is it?",
    options: ["Hole", "Mountain", "Tree", "River"],
    answer: "Hole",
    explanation: "Removing material makes a hole larger.",
    aiApproach: "Analyzes inverse relationships in database. Filters objects where size increases with subtraction.",
    humanApproach: "Conceptual thinking about physical removal. Visualizes digging a hole."
  },
  {
    id: 11,
    type: "math",
    question: "What is 15% of 200?",
    options: ["15", "25", "30", "35"],
    answer: "30",
    explanation: "15% = 0.15. 0.15 × 200 = 30",
    aiApproach: "Converts percentage to decimal (15/100 = 0.15), performs multiplication operation.",
    humanApproach: "Mental calculation: 10% of 200 is 20, half of that is 10, so 20+10=30."
  },
  {
    id: 12,
    type: "logic",
    question: "Square is to Cube as Circle is to ?",
    options: ["Triangle", "Sphere", "Oval", "Rectangle"],
    answer: "Sphere",
    explanation: "2D shape to 3D shape analogy.",
    aiApproach: "Dimensional relationship detection. Maps 2D→3D transformations in geometric space.",
    humanApproach: "Conceptual analogy: 'Square becomes cube in 3D, so circle becomes sphere in 3D.'"
  },
  {
    id: 13,
    type: "pattern",
    question: "What's the missing letter: A, C, F, J, ?",
    options: ["L", "N", "O", "P"],
    answer: "O",
    explanation: "Skip pattern increases: +1, +2, +3, +4, +5 (O)",
    aiApproach: "Calculates differences between positions: 2, 3, 4. Predicts next difference is 5.",
    humanApproach: "Spots growing gaps between letters and continues the pattern."
  },
  {
    id: 14,
    type: "riddle",
    question: "What has keys but no locks, space but no room?",
    options: ["Piano", "Keyboard", "Map", "Book"],
    answer: "Keyboard",
    explanation: "Computer keyboard has keys and spacebar.",
    aiApproach: "Multi-word semantic search: objects with 'keys' AND 'space' components.",
    humanApproach: "Modern technology reference. Thinks of everyday computer use."
  },
  {
    id: 15,
    type: "math",
    question: "If x + 5 = 12, what is x?",
    options: ["5", "6", "7", "17"],
    answer: "7",
    explanation: "Subtract 5 from both sides: x = 12 - 5 = 7",
    aiApproach: "Algebraic solver: isolate variable by applying inverse operation (-5 to both sides).",
    humanApproach: "'What number plus 5 equals 12?' Mental trial: 7+5=12."
  },
  {
    id: 16,
    type: "logic",
    question: "Some birds can fly. Penguins are birds. Therefore...",
    options: ["Penguins can fly", "Penguins cannot fly", "Some penguins fly", "All birds fly"],
    answer: "Penguins cannot fly",
    explanation: "Requires additional knowledge beyond pure logic.",
    aiApproach: "Queries knowledge base about penguin characteristics. Finds exception to 'birds fly' rule.",
    humanApproach: "Real-world knowledge: 'I know penguins can't fly even though they're birds.'"
  },
  {
    id: 17,
    type: "pattern",
    question: "Complete: 100, 90, 81, 73, ?",
    options: ["64", "66", "70", "72"],
    answer: "66",
    explanation: "Differences: -10, -9, -8, -7 (next is 66)",
    aiApproach: "Analyzes delta sequence: -10, -9, -8. Predicts next delta is -7.",
    humanApproach: "Notices decreasing gaps: 'subtract 10, then 9, then 8, so next subtract 7.'"
  },
  {
    id: 18,
    type: "riddle",
    question: "What travels around the world but stays in one corner?",
    options: ["Stamp", "Cloud", "Wind", "Light"],
    answer: "Stamp",
    explanation: "Postage stamp stays in envelope corner while mail travels.",
    aiApproach: "Constraint satisfaction: object in corner + global travel capability. Cross-reference postal system.",
    humanApproach: "Clever wordplay and practical knowledge of how mail works."
  },
  {
    id: 19,
    type: "math",
    question: "3 cats catch 3 mice in 3 minutes. 100 cats catch 100 mice in?",
    options: ["3 min", "100 min", "300 min", "10 min"],
    answer: "3 min",
    explanation: "Rate is constant: each cat catches 1 mouse in 3 minutes.",
    aiApproach: "Establishes rate function: 1 cat = 1 mouse / 3 min. Scales linearly for 100 cats.",
    humanApproach: "'If 3 cats take 3 minutes for 3 mice, 100 cats working together still take 3 minutes for 100 mice.'"
  },
  {
    id: 20,
    type: "logic",
    question: "Which is the odd one out: Dog, Cat, Bird, Table?",
    options: ["Dog", "Cat", "Bird", "Table"],
    answer: "Table",
    explanation: "Table is not a living thing / animal.",
    aiApproach: "Classification algorithm: groups entities by properties (animate/inanimate).",
    humanApproach: "Common sense categorization: 'Three are animals, one is furniture.'"
  }
];
