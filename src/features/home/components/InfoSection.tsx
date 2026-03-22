'use client';
import Button from '@/components/buttons/Button';
export default function InfoSection() {
  return (
    <section className="bg-neutral-900 text-neutral-0 py-16 px-6 flex flex-row items-center">
      <div className="flex flex-col items-start">
        <h2 className="text-3xl font-semibold mb-4">Calling all creators</h2>

        <p className="max-w-xl text-lg mb-6 text-gray-300">
          Get on our platform to connect with fans, share your sounds, and grow
          your audience. What are you waiting for?
        </p>

        <Button variant="secondary">Find out more</Button>
      </div>
      <div>
        <img
          src="https://i1.sndcdn.com/artworks-fNxVStvNE7txxeyJ-MAA8Qw-t500x500.jpg"
          alt="Find out more about us"
        />
      </div>
    </section>
  );
}
