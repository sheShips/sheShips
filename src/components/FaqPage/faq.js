
export const CONTACTS = [
  { name: 'Madison Callahan', email: 'madison.callahan@securipolis.com' },
  { name: 'Tierney McFadden', email: 'tierney@whelkworks.com' },
]

export const FAQS = [
  {
    id: 'who-can-join',
    q: 'Who can join She Ships?',
    answer: [
      'Any woman who codes, or wants to. Trans women are women here, and nonbinary folks who feel at home in a women-centered space are welcome too. Come to learn, to build something with others, or just to find your tech girlies.',
    ],
  },
  {
    id: 'experience',
    q: 'Do I need to be an experienced developer?',
    answer: [
      'Not at all. First “Hello, world” or ten years in, there’s a seat for you. Students, bootcamp grads, career changers and self-taught devs are all welcome, and nobody here expects you to know everything.',
    ],
  },
  {
    id: 'cost',
    q: 'Is it free?',
    answer: [
      'Yes, joining is free, and so are most events. If one ever has a cost, we’ll say so clearly up front.',
      'When we meet somewhere like a café or restaurant, your own food and drinks are on you unless we say otherwise. You don’t need to bring anything, though a laptop is always welcome if you’d like to show people what you’re working on.',
    ],
  },
  {
    id: 'when-where',
    q: 'Where and how often do you meet?',
    answer: [
      'For now, about once a month while we find our footing. Every event has its own spot and time, and you’ll always find the details on our calendar and our socials.',
    ],
  },
  {
    id: 'what-happens',
    q: 'What happens at a meetup?',
    answer: [
      'It changes from one to the next: talks, hands-on workshops, hack days, pair programming, portfolio reviews, or simply good conversation with people who get it.',
      'Got an idea for an event? We’re all ears. Tell us what you’d love to see.',
    ],
  },
  {
    id: 'areas',
    q: 'What areas do you cover?',
    answer: [
      'Southwest Florida and the Tampa Bay area: Sarasota, Manatee, Charlotte and Lee counties, plus Tampa and St. Pete. Events move around the region.',
    ],
  },
  {
    id: 'stay-in-the-loop',
    q: 'How do I stay in the loop?',
    answer: [
      'Follow She Ships on Luma at luma.com/sheships and you’ll hear about every new event first. You can also follow along on LinkedIn and Instagram.',
    ],
  },
  {
    id: 'hiring-sponsor-speak',
    q: 'I’m hiring, or want to sponsor or speak. How do I reach you?',
    answer: ['We’d love to hear from you! Reach out to {contacts}.'],
  },
  {
    id: 'whos-behind',
    q: 'Who’s behind She Ships?',
    answer: ['She Ships is presented by Securipolis and Whelk Works, and built by and for the women in it.'],
  },
]

export function answerText(item) {
  const contacts = CONTACTS.map((c) => `${c.name} (${c.email})`).join(' or ')
  return item.answer.map((p) => p.replace('{contacts}', contacts)).join(' ')
}
