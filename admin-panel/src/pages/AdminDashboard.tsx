import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getToken } from '../utils/token';

interface Lawyer {
  id: number;
  full_name: string;
  phone_number: string;
  nic_number: string;
  expertise: string;
  location: string;
  qualifications: string;
  approved: boolean;
  user_id: number;
  created_at?: string;
}

export default function AdminDashboard() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [filter, setFilter] = useState<'approved' | 'unapproved'>('unapproved');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'nic' | 'created_at'>('created_at');
  const token = getToken();

  useEffect(() => {
    const fetchLawyers = async () => {
      const endpoint =
        filter === 'unapproved'
          ? 'users/unapproved-lawyers/'
          : 'users/approved-lawyers/';

      try {
        const res = await api.get(endpoint, {
          headers: { Authorization: `Token ${token}` },
        });
        setLawyers(res.data);
      } catch (err) {
        console.error('Failed to load lawyers:', err);
      }
    };

    fetchLawyers();
  }, [filter]);

  const approveLawyer = async (userId: number) => {
    try {
      await api.post(
        `users/approve-lawyer/${userId}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setLawyers((prev) => prev.filter((lawyer) => lawyer.user_id !== userId));
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const filteredAndSortedLawyers = [...lawyers]
    .filter((lawyer) =>
      lawyer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'nic') {
        return a.nic_number.localeCompare(b.nic_number);
      } else {
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}> Lawyer Management</h2>

      <div style={styles.toolbar}>
        <div style={styles.toggleRow}>
          <button
            style={filter === 'unapproved' ? styles.activeToggle : styles.toggle}
            onClick={() => setFilter('unapproved')}
          >
            Unapproved
          </button>
          <button
            style={filter === 'approved' ? styles.activeToggle : styles.toggle}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'nic' | 'created_at')}
          style={styles.select}
        >
          <option value="created_at">Sort by Registration Date</option>
          <option value="nic">Sort by NIC</option>
        </select>
      </div>

      {filteredAndSortedLawyers.length === 0 ? (
        <p style={styles.empty}>No {filter} lawyers found.</p>
      ) : (
        <div style={styles.cardWrapper}>
          {filteredAndSortedLawyers.map((lawyer) => (
            <div key={lawyer.id} style={styles.card}>
              <h3 style={styles.lawyerName}>{lawyer.full_name}</h3>
              <div style={styles.metaRow}><strong>NIC:</strong> {lawyer.nic_number}</div>
              <div style={styles.metaRow}><strong>Phone:</strong> {lawyer.phone_number}</div>
              <div style={styles.metaRow}><strong>Expertise:</strong> {lawyer.expertise}</div>
              <div style={styles.metaRow}><strong>Location:</strong> {lawyer.location}</div>
              <div style={styles.metaRow}>
                <strong>Qualification:</strong>{' '}
                <a
                  href={`http://127.0.0.1:8000/${lawyer.qualifications}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  View File
                </a>
              </div>
              {filter === 'unapproved' && (
                <button
                  style={styles.button}
                  onClick={() => approveLawyer(lawyer.user_id)}
                >
                  ✅ Approve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 1000,
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: 30,
  },
  toggleRow: {
    display: 'flex',
    gap: 10,
  },
  toggle: {
    padding: '10px 20px',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  },
  activeToggle: {
    padding: '10px 20px',
    borderRadius: 8,
    backgroundColor: '#AFA2A2',
    border: 'none',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  searchInput: {
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #ccc',
    flex: 1,
    minWidth: 200,
  },
  select: {
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #ccc',
  },
  cardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    borderLeft: '5px solid #AFA2A2',
  },
  lawyerName: {
    fontSize: 20,
    marginBottom: 10,
    color: '#34495e',
  },
  metaRow: {
    marginBottom: 6,
    fontSize: 14.5,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#27ae60',
    color: '#fff',
    padding: '10px 16px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 600,
    width: '100%',
  },
  link: {
    color: '#3498db',
    fontWeight: 500,
    textDecoration: 'none',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
    fontStyle: 'italic',
  },
};
